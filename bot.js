/**
 * solata.top TG bot —— 发地址 → 秒回「锁了 X SOL 租金」+ 跳网页退
 *
 * 部署/启动：
 *   1. 用 @BotFather 创建 bot，拿到 token
 *   2. 服务器上（与主服务同机）：
 *      TG_BOT_TOKEN=xxx SOLATA_API=http://127.0.0.1:3725 pm2 start bot.js --name solata-bot
 *      （本地测试 SOLATA_API 默认 https://solata.top）
 *
 * 依赖：Node 22+（全局 fetch / AbortSignal.timeout）、@solana/web3.js（校验地址）
 * 说明：复用主服务的 /api/scan + /api/progress，只做「查询 + 回链接」，退回仍在网页完成（签名模式）。
 */
const { PublicKey } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const STATS_FILE = path.join(__dirname, "bot-stats.jsonl");

const TOKEN = process.env.TG_BOT_TOKEN;
const API = process.env.SOLATA_API || "https://solata.top"; // 服务端内部调用主服务（服务器上可设 127.0.0.1:3725）
const PUBLIC_URL = process.env.PUBLIC_URL || "https://solata.top"; // 用户跳转链接（必须公网）
const FEE_SOL = 0.0002; // 每账户手续费（与主服务 FEE_LAMPORTS 一致）

if (!TOKEN) {
  console.error("❌ 缺少 TG_BOT_TOKEN 环境变量");
  process.exit(1);
}

const TG = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${TG}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (!j.ok) console.error(`[tg] ${method} 失败:`, JSON.stringify(j));
  return j;
}

function isSolAddress(s) {
  try { new PublicKey(s); return true; } catch { return false; }
}

// ===== 查询统计（只记地址 + 结果，不记私钥；写 bot-stats.jsonl 持久化）=====
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
let stats = { totalQueries: 0, totalAccounts: 0, totalSol: 0, todayQueries: 0, todayKey: todayStr() };

function loadStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) return;
    for (const l of fs.readFileSync(STATS_FILE, "utf8").split("\n")) {
      if (!l.trim()) continue;
      try {
        const r = JSON.parse(l);
        stats.totalQueries++;
        stats.totalAccounts += r.recoverableCount || 0;
        stats.totalSol += r.recoverableSol || 0;
        if (r.date === stats.todayKey) stats.todayQueries++;
      } catch (_) {}
    }
  } catch (e) { console.error("[stats] 加载失败:", e.message); }
}

function logQuery(rec) {
  const date = todayStr();
  if (date !== stats.todayKey) { stats.todayKey = date; stats.todayQueries = 0; }
  stats.totalQueries++;
  stats.todayQueries++;
  stats.totalAccounts += rec.recoverableCount || 0;
  stats.totalSol += rec.recoverableSol || 0;
  fs.appendFile(STATS_FILE, JSON.stringify({ date, ts: Date.now(), ...rec }) + "\n", () => {});
}

/** 调主服务扫描地址，返回 scanWallet 的 result（含 summary） */
async function scanAddress(addr) {
  const r = await fetch(`${API}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: addr }),
  });
  const d = await r.json();
  if (!r.ok || d.error) throw new Error(d.error || "scan failed");
  const jobId = d.jobId;
  for (let i = 0; i < 60; i++) {
    const pr = await fetch(`${API}/api/progress/${jobId}`).then((x) => x.json());
    if (pr.status === "done") return pr.result;
    if (pr.status === "error") throw new Error(pr.error || "scan error");
    await new Promise((r2) => setTimeout(r2, 800));
  }
  throw new Error("scan timeout");
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  if (text === "/stats" || text === "/统计") {
    return tg("sendMessage", {
      chat_id: chatId,
      text: `📊 查询统计\n\n🔹 累计查询：${stats.totalQueries} 次\n🔹 今日查询：${stats.todayQueries} 次\n🔹 累计发现可退账户：${stats.totalAccounts} 个\n🔹 累计可退租金：${stats.totalSol.toFixed(6)} SOL`,
    });
  }
  if (text.startsWith("/start") || text.startsWith("/help")) {
    return tg("sendMessage", {
      chat_id: chatId,
      text: "👋 把任意 Solana 钱包地址发给我，我帮你查有多少死账户租金能退回。\n\n💡 每交易一个不同的币，Solana 会自动开一个代币账户，每个锁约 0.002 SOL 租金。归零币/垃圾币/貔貅币卖不掉、账户也关不了，这笔钱就卡在链上。\n\n💰 退回只需付 10% 手续费（每账户 0.0002 SOL）。\n\n👇 直接粘贴地址（群里 @我 也行）：",
    });
  }
  if (!text) return null;
  if (!isSolAddress(text)) {
    return tg("sendMessage", {
      chat_id: chatId,
      text: "⚠️ 这看起来不是有效的 Solana 地址。请粘贴以 1-9 / A-Z 开头的 32~44 位地址。",
    });
  }

  tg("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
  try {
    const result = await scanAddress(text);
    const s = result.summary;
    if (!s || !s.recoverableCount) {
      return tg("sendMessage", {
        chat_id: chatId,
        text: `😕 这个地址没有可退回租金的死账户。\n\n代币账户总数：${s ? s.total : 0}，可回收：0。`,
      });
    }
    const sol = s.recoverableSol.toFixed(6);
    const fee = (s.recoverableCount * FEE_SOL).toFixed(6);
    logQuery({ chatType: msg.chat.type, address: text, recoverableCount: s.recoverableCount, recoverableSol: s.recoverableSol });
    const net = (s.recoverableSol - s.recoverableCount * FEE_SOL).toFixed(6);
    return tg("sendMessage", {
      chat_id: chatId,
      text: `💰 这个地址锁了 <b>${sol} SOL</b> 租金！\n\n🔹 可退账户：${s.recoverableCount} 个\n🔹 手续费：${fee} SOL（10%）\n🔹 预计到账：<b>${net} SOL</b>\n\n👉 连接钱包一键退回：`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "🚀 立即退回", url: PUBLIC_URL }]],
      },
    });
  } catch (e) {
    return tg("sendMessage", {
      chat_id: chatId,
      text: "❌ 查询失败，请稍后重试。\n" + (e.message || ""),
    });
  }
}

// 简单并发限制：同时最多 4 个扫描（RPC 节流，避免群聊刷屏打爆主服务）
let inflight = 0;
const QUEUE = [];
function enqueue(fn) {
  return new Promise((resolve, reject) => {
    QUEUE.push({ fn, resolve, reject });
    drain();
  });
}
function drain() {
  while (inflight < 4 && QUEUE.length) {
    const t = QUEUE.shift();
    inflight++;
    t.fn()
      .then(t.resolve, t.reject)
      .finally(() => { inflight--; drain(); });
  }
}

let offset = 0;
async function poll() {
  try {
    const r = await fetch(`${TG}/getUpdates?timeout=30&offset=${offset}`, {
      signal: AbortSignal.timeout(40000),
    });
    const d = await r.json();
    if (d.ok && d.result) {
      for (const u of d.result) {
        offset = u.update_id + 1;
        if (u.message) {
          enqueue(() => handleMessage(u.message)).catch((e) =>
            console.error("[bot] handle err:", e.message)
          );
        }
      }
    }
  } catch (_) {
    // long poll 超时是正常返回，静默继续
  }
  poll();
}

loadStats();
console.log("🤖 solata TG bot 启动（long polling）… API:", API, "| 累计查询:", stats.totalQueries);
poll();
