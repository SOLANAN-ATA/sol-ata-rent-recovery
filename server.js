/**
 * SOLANA ATA 租金退回系统
 * 入口：Express 服务 + 静态网页
 * 签名模式：方案A——用户连钱包签名关户，租金进平台，平台转净额给用户（/api/build-redeem-tx + /api/submit-tx + /api/forward）
 */
const express = require("express");
const path = require("path");
const { Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const { DONATION_ADDRESS, PORT, RPCS, FEE_PAYER_SECRET_KEY } = require("./config");
const { scanWallet } = require("./lib/scan");
const { buildRedeemTransactions } = require("./lib/txbuild");
const { log, subscribe } = require("./lib/log");
const { checkRpcHealth, broadcastTransaction, transferSol } = require("./lib/solana");

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
app.post("/api/scan", async (req, res) => {
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
app.post("/api/build-redeem-tx", async (req, res) => {
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
app.post("/api/forward", async (req, res) => {
  try {
    const requestId = (req.body && req.body.requestId || "").trim();
    const reqInfo = redeemRequests.get(requestId);
    if (!reqInfo) return res.status(404).json({ error: "requestId 不存在或已过期" });
    if (reqInfo.used) return res.status(400).json({ error: "该请求已转发过" });
    if (!FEE_PAYER_KP) return res.status(500).json({ error: "未配置平台钱包（FEE_PAYER_SECRET_KEY）" });
    if (reqInfo.netLamports <= 0) { reqInfo.used = true; return res.json({ signature: null, netSol: 0 }); }
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
});
