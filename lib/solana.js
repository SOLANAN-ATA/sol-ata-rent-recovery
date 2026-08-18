/**
 * sol-zero-recovery — Solana RPC 客户端（多端点轮换 + fallback）
 */
const https = require("https");
const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require("@solana/spl-token");
const { RPCS } = require("../config");

let idx = 0;

/** 全局限流：控制请求最小间隔，避免被免费 RPC 限流/封禁 */
let lastReq = 0;
const MIN_INTERVAL = 150;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, lastReq + MIN_INTERVAL - now);
  lastReq = Math.max(now, lastReq + MIN_INTERVAL);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

// ===== RPC 熔断：quota 耗尽 / 持续失败时跳过该端点（默认冷却 10 分钟）=====
const deadUntil = new Map(); // url -> 恢复时间戳
const BREAK_MS = 10 * 60 * 1000;
function isDead(url) {
  const t = deadUntil.get(url);
  return t !== undefined && Date.now() < t;
}
function markDead(url, ms = BREAK_MS) {
  deadUntil.set(url, Date.now() + ms);
}
// 存活端点；若全部熔断则兜底仍返回全部（避免彻底不可用）
function activeRpcs() {
  const live = RPCS.filter((url) => !isDead(url));
  return live.length ? live : RPCS;
}

/** 轮换 Connection */
function conn() {
  return new Connection(RPCS[idx++ % RPCS.length], "confirmed");
}

/** 向指定 URL 发原生 JSON-RPC 请求（带全局限流） */
async function rpcCallWithUrl(url, body, timeoutMs = 20000) {
  await throttle();
  return new Promise((resolve) => {
    const u = new URL(url);
    const json = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(json) },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        // 429 / quota 耗尽 → 熔断该端点，后续自动跳到其它 RPC
        if (res.statusCode === 429) { markDead(url); resolve(null); return; }
        try {
          const j = JSON.parse(d);
          const msg = (j && j.error && j.error.message) || "";
          if (/quota|exceeded|rate.?limit|too many requests|429/i.test(msg)) markDead(url);
          resolve(j);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
    req.write(json);
    req.end();
  });
}

/** 顺序尝试各 RPC 端点，第一个成功即返回；全部失败带重试（避免同时打所有端点被限流） */
async function rpcCall(method, params, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const url of activeRpcs()) {
      const r = await rpcCallWithUrl(url, { jsonrpc: "2.0", id: 1, method, params }, 10000);
      if (r && r.result !== undefined && r.result !== null) return r.result;
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
  }
  throw new Error(`RPC 调用失败: ${method}`);
}

/** 获取某地址的全部代币账户（标准 Token + Token-2022 两个程序，并行） */
async function getTokenAccounts(ownerPubkey) {
  const owner = ownerPubkey.toBase58();
  const programs = [
    ["token", TOKEN_PROGRAM_ID],
    ["token2022", TOKEN_2022_PROGRAM_ID],
  ];
  const results = await Promise.all(
    programs.map(async ([tag, programId]) => {
      const list = await rpcCall("getTokenAccountsByOwner", [
        owner,
        { programId: programId.toBase58() },
        { encoding: "jsonParsed" },
      ]);
      const arr = [];
      for (const a of (list && list.value) || []) {
        const info = a.account.data.parsed.info;
        arr.push({
          account: new PublicKey(a.pubkey),
          mint: new PublicKey(info.mint),
          mintStr: info.mint,
          amountRaw: info.tokenAmount.amount,
          amountUi: info.tokenAmount.uiAmountString,
          decimals: info.tokenAmount.decimals,
          state: info.state || "initialized",
          program: programId,
          tag,
        });
      }
      return arr;
    })
  );
  return results.flat();
}

/** 获取账户原始信息（base64 解码） */
async function getAccountInfo(pubkey) {
  const r = await rpcCall("getAccountInfo", [pubkey.toBase58(), { encoding: "base64" }]);
  if (!r || !r.value) return null;
  return {
    lamports: r.value.lamports,
    owner: r.value.owner,
    data: Buffer.from(r.value.data[0], "base64"),
  };
}

/** 获取 SOL 余额（lamports） */
async function getBalance(pubkey) {
  const r = await rpcCall("getBalance", [pubkey.toBase58()]);
  return r && typeof r.value === "number" ? r.value : 0;
}

/** 并行广播交易到所有 RPC，返回第一个签名（避免单个端点不转发） */
async function broadcastTransaction(b64) {
  const body = {
    jsonrpc: "2.0", id: 1, method: "sendTransaction",
    params: [b64, { encoding: "base64", skipPreflight: true, maxRetries: 3 }],
  };
  const results = await Promise.all(activeRpcs().map((url) => rpcCallWithUrl(url, body, 15000)));
  for (const r of results) {
    if (r && typeof r.result === "string") return r.result;
  }
  return null;
}

/** 并行查询交易状态，返回第一个命中的状态对象 */
async function getSignatureStatusAll(sig) {
  const body = {
    jsonrpc: "2.0", id: 1, method: "getSignatureStatuses",
    params: [[sig], { searchTransactionHistory: true }],
  };
  const results = await Promise.all(activeRpcs().map((url) => rpcCallWithUrl(url, body, 8000)));
  for (const r of results) {
    const v = r && r.result && r.result.value && r.result.value[0];
    if (v) return v;
  }
  return null;
}

/** 检查单个 RPC 端点健康（getHealth） */
async function checkRpcHealth(url) {
  const r = await rpcCallWithUrl(url, { jsonrpc: "2.0", id: 1, method: "getHealth" }, 6000);
  return !!(r && r.result === "ok");
}

module.exports = { conn, rpcCall, getTokenAccounts, getAccountInfo, getBalance, broadcastTransaction, getSignatureStatusAll, checkRpcHealth };
