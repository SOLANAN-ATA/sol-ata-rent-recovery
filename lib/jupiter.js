/**
 * sol-zero-recovery — Jupiter 报价（判断代币是否还有价值）
 *
 * 注意：Jupiter / CoinGecko / DexScreener 在部分网络环境（如国内）不可达。
 * 因此带「熔断」：一旦网络失败，短时间内直接返回 null（按归零币处理），
 * 避免每次扫描都卡 15 秒超时。
 */
const https = require("https");

const NATIVE_MINT = "So11111111111111111111111111111111111111112";
const TIMEOUT_MS = 4000;
const BREAK_MS = 5 * 60 * 1000; // 熔断 5 分钟

let breakUntil = 0;

/** 发起 GET，返回 { ok, json } | { ok:false, reason }（带整体超时，覆盖 DNS/连接阶段） */
function jupRequest(url, timeoutMs = TIMEOUT_MS) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    const req = https.get(
      url,
      { headers: { "User-Agent": "sol-zero-recovery/1.0" } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { finish({ ok: true, json: JSON.parse(d) }); } catch { finish({ ok: true, json: null }); }
        });
      }
    );
    const timer = setTimeout(() => { req.destroy(); finish({ ok: false, reason: "timeout" }); }, timeoutMs);
    req.on("error", () => finish({ ok: false, reason: "error" }));
    req.on("close", () => clearTimeout(timer));
  });
}

const cache = new Map();

/**
 * 查询某代币余额能换回多少 SOL（lamports）
 * @returns {BigInt|null} 无报价/无流动性/网络不可达均返回 null
 */
async function getTokenValueLamports(mintStr, amountRaw) {
  if (!amountRaw || amountRaw === "0") return 0n;
  const key = `${mintStr}:${amountRaw}`;
  if (cache.has(key)) return cache.get(key);
  if (Date.now() < breakUntil) return null; // 熔断中，直接跳过

  const url =
    `https://quote-api.jup.ag/v6/quote` +
    `?inputMint=${mintStr}` +
    `&outputMint=${NATIVE_MINT}` +
    `&amount=${amountRaw}` +
    `&slippageBps=100`;

  let result = null;
  const r = await jupRequest(url);
  if (r.ok) {
    // 正常 HTTP 响应：有 outAmount 即有价值；否则无流动性=归零
    if (r.json && !r.json.error && r.json.outAmount) {
      try { result = BigInt(r.json.outAmount); } catch { result = null; }
    }
  } else {
    // 网络失败：熔断，后续直接按归零处理
    breakUntil = Date.now() + BREAK_MS;
  }

  cache.set(key, result);
  return result;
}

module.exports = { getTokenValueLamports };
