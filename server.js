/**
 * SOLANA ATA 租金退回系统
 * 入口：Express 服务 + 静态网页
 * 签名模式：方案A——用户连钱包签名关户，租金进平台，平台转净额给用户（/api/build-redeem-tx + /api/submit-tx + /api/forward）
 */
const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const { DONATION_ADDRESS, PORT, RPCS, FEE_PAYER_SECRET_KEY } = require("./config");
const { scanWallet } = require("./lib/scan");
const { buildRedeemTransactions } = require("./lib/txbuild");
const { log, subscribe } = require("./lib/log");
const { checkRpcHealth, broadcastTransaction, transferSol, getBalance } = require("./lib/solana");

// 平台手续费支付钱包（签名模式代付交易费）
const FEE_PAYER_KP = (() => {
  try {
    return Keypair.fromSecretKey(bs58.decode(FEE_PAYER_SECRET_KEY));
  } catch (e) {
    console.error("⚠️ 无法解析平台手续费支付钱包私钥，签名模式不可用:", e.message);
    return null;
  }
})();

const app = express();
app.use(express.json({ limit: "1mb" }));

// 信任 Nginx 反代，识别真实客户端 IP（限流按真实 IP 计）
app.set("trust proxy", 1);

// 全局限流：每 IP 每分钟 120 次
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  headers: false,
  message: { error: "请求过于频繁，请稍后再试" },
});
app.use(globalLimiter);

// 扫描/构造交易（耗 RPC）更严格限流
const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  headers: false,
  message: { error: "扫描过于频繁，请稍后再试" },
});

// 转发净额（敏感，动平台钱包资金）严格限流
const forwardLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  headers: false,
  message: { error: "操作过于频繁，请稍后再试" },
});

app.use(express.static(path.join(__dirname, "public")));

// 浏览器端 web3.js（本地 vendor，避免 CDN 依赖）
app.get("/vendor/web3.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(__dirname, "node_modules/@solana/web3.js/lib/index.iife.min.js"));
});

// ===== 后台任务 + 实时日志 =====
const jobs = new Map(); // jobId -> { status, logs, result, error }

// 方案A：转发请求追踪（requestId -> { address, netLamports, used, createdAt }）
const redeemRequests = new Map();

// ===== 热钱包归集：余额 > 0.1 SOL 时，多余部分转到冷钱包（DONATION_ADDRESS）=====
// 设计：91nSV…（FEE_PAYER，私钥在 .env）只留少量运转资金，超过阈值扫到冷钱包少放钱
const SWEEP_THRESHOLD_LAMPORTS = 100000000; // 0.1 SOL
const SWEEP_RESERVE_LAMPORTS = 5000; // 预留转账手续费（~0.000005 SOL）
let sweeping = false; // 并发保护：避免归集重入
async function sweepIfNeeded() {
  if (sweeping || !FEE_PAYER_KP) return;
  sweeping = true;
  try {
    const balance = await getBalance(FEE_PAYER_KP.publicKey);
    if (balance <= SWEEP_THRESHOLD_LAMPORTS) return;
    const toSend = balance - SWEEP_THRESHOLD_LAMPORTS - SWEEP_RESERVE_LAMPORTS;
    if (toSend <= 0) return;
    log(`🏦 归集热钱包多余 ${(toSend / 1e9).toFixed(6)} SOL → 冷钱包 ${DONATION_ADDRESS.slice(0, 8)}…`);
    const sig = await transferSol(FEE_PAYER_KP, new PublicKey(DONATION_ADDRESS), toSend);
    log(`✅ 归集完成 ${sig}`);
  } catch (e) {
    console.error("⚠️ 热钱包归集失败:", e.message);
  } finally {
    sweeping = false;
  }
}

function startJob(fn) {
  const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const job = { status: "running", logs: [], result: null, error: null };
  jobs.set(jobId, job);
  const unsub = subscribe((line) => job.logs.push(line));
  (async () => {
    try {
      job.result = await fn();
      job.status = "done";
    } catch (e) {
      job.error = e.message;
      job.status = "error";
    } finally {
      unsub();
      setTimeout(() => jobs.delete(jobId), 10 * 60 * 1000);
    }
  })();
  return jobId;
}

// 地址查询（只读，无需私钥）
app.post("/api/scan", scanLimiter, async (req, res) => {
  try {
    const addr = (req.body && req.body.address || "").trim();
    if (!addr) return res.status(400).json({ error: "缺少 address 参数" });
    const pk = new PublicKey(addr);
    log(`🔍 开始扫描地址 ${addr}`);
    const jobId = startJob(() => scanWallet(pk));
    res.json({ jobId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 进度查询
app.get("/api/progress/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "任务不存在或已过期" });
  const after = parseInt(req.query.after) || 0;
  res.json({
    status: job.status,
    logs: job.logs.slice(after),
    total: job.logs.length,
    result: job.status === "done" ? job.result : null,
    error: job.error,
  });
});

// RPC 端点 + 健康状态
app.get("/api/rpc", async (req, res) => {
  const mask = (u) =>
    u.replace(/api-key=[^&"]+/, "api-key=***").replace(/solana\/[a-f0-9]{64}/, "solana/***");
  const rpcs = await Promise.all(
    RPCS.map(async (url) => ({ url: mask(url), ok: await checkRpcHealth(url) }))
  );
  res.json({ donation: DONATION_ADDRESS, rpcs });
});

// ===== 签名模式（方案A）：用户签名关户 → 租金进平台 → 平台转净额 =====

// 构造关户交易（方案A：租金进平台，用户自己签名+付手续费）
app.post("/api/build-redeem-tx", scanLimiter, async (req, res) => {
  try {
    const addr = (req.body && req.body.address || "").trim();
    if (!addr) return res.status(400).json({ error: "缺少 address 参数" });
    if (!FEE_PAYER_KP) return res.status(500).json({ error: "未配置平台钱包（FEE_PAYER_SECRET_KEY）" });
    const userPk = new PublicKey(addr);
    const result = await buildRedeemTransactions(userPk, FEE_PAYER_KP.publicKey, {
      forceBurnValuable: !!(req.body && req.body.forceBurnValuable),
    });
    if (!result.targetCount) return res.json(result);
    const requestId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    redeemRequests.set(requestId, { address: userPk.toBase58(), netLamports: result.netLamports, used: false, createdAt: Date.now() });
    // 清理过期请求（>1 小时）
    for (const [k, v] of redeemRequests) {
      if (Date.now() - v.createdAt > 3600000) redeemRequests.delete(k);
    }
    res.json({ ...result, requestId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 方案A：平台转净额给用户（用户广播关户交易后调用）
app.post("/api/forward", forwardLimiter, async (req, res) => {
  try {
    const requestId = (req.body && req.body.requestId || "").trim();
    const reqInfo = redeemRequests.get(requestId);
    if (!reqInfo) return res.status(404).json({ error: "requestId 不存在或已过期" });
    if (reqInfo.used) return res.status(400).json({ error: "该请求已转发过" });
    if (!FEE_PAYER_KP) return res.status(500).json({ error: "未配置平台钱包（FEE_PAYER_SECRET_KEY）" });
    if (reqInfo.netLamports <= 0) { reqInfo.used = true; return res.json({ signature: null, netSol: 0 }); }
    // 等待关户交易的租金到账（广播后链上确认需数秒，避免平台钱包余额不足导致转账失败）
    let balance = await getBalance(FEE_PAYER_KP.publicKey);
    const deadline = Date.now() + 30000; // 最多等 30 秒
    while (balance < reqInfo.netLamports && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));
      balance = await getBalance(FEE_PAYER_KP.publicKey);
    }
    if (balance < reqInfo.netLamports) {
      return res.status(500).json({ error: "平台钱包余额不足，关户租金尚未到账，请稍后重试" });
    }
    log(`💸 方案A 转发净额 ${(reqInfo.netLamports / 1e9).toFixed(6)} SOL → ${reqInfo.address.slice(0, 8)}…`);
    const sig = await transferSol(FEE_PAYER_KP, new PublicKey(reqInfo.address), reqInfo.netLamports);
    reqInfo.used = true;
    res.json({ signature: sig, netSol: reqInfo.netLamports / 1e9 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 广播用户已签名的交易
app.post("/api/submit-tx", async (req, res) => {
  try {
    const b64 = (req.body && req.body.tx || "").trim();
    if (!b64) return res.status(400).json({ error: "缺少 tx 参数" });
    const sig = await broadcastTransaction(b64);
    if (!sig) return res.status(500).json({ error: "所有 RPC 发送失败" });
    res.json({ signature: sig });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 默认只监听本机回环，避免私钥服务暴露到局域网/公网
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log("==============================================");
  console.log("  SOLANA ATA 租金退回系统 已启动");
  console.log(`  访问: http://localhost:${PORT}`);
  console.log(`  监听: ${HOST}:${PORT}（仅本机，私钥不外露）`);
  console.log(`  平台手续费地址: ${DONATION_ADDRESS}`);
  console.log("==============================================");

  // 热钱包归集定时任务：每 10 分钟检查一次，余额 > 0.1 SOL 自动扫到冷钱包
  const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
  setInterval(() => {
    sweepIfNeeded().catch((e) => console.error("⚠️ 归集定时任务异常:", e.message));
  }, SWEEP_INTERVAL_MS);
});
