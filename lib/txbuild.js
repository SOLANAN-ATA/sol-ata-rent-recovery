/**
 * SOLANA ATA 租金退回系统 — 签名模式交易构造（方案 A）
 *
 * 方案 A：关户租金先进平台钱包 → 平台逐笔转净额（租金 - 手续费）给用户。
 * 用户每笔只签一次简单交易（销毁 + 关户，租金进平台地址），用户自己是 fee payer，
 * 无需部分签名 → 移动端钱包（WalletConnect）友好。
 *
 * 2026-08-20 重构：拆成「扫描分类分批」+「逐笔构造」两步。
 *   - classifyAndChunk: 扫描 + 分类 + 按 1232 字节上限分批（不序列化最终交易）
 *   - buildChunkTx: 每次调用单独取一个 FRESH blockhash 构造单笔交易
 * 这样「赎回一笔 → 转走一笔」，避免多笔交易共用一个 blockhash 导致后几笔过期作废，
 * 也避免 all-or-nothing：客户签几笔就能拿回几笔的净额。
 */
const { Transaction, ComputeBudgetProgram } = require("@solana/web3.js");
const { createBurnInstruction, createCloseAccountInstruction } = require("@solana/spl-token");
const { rpcCall } = require("./solana");
const { buildClassification } = require("./scan");
const { log } = require("./log");
const { RENT_LAMPORTS, FEE_LAMPORTS } = require("../config");

// Solana 交易大小上限（字节）。
// 官方 PACKET_DATA_SIZE = 1232，但移动端钱包（WalletConnect/AppKit 的 signTransaction 会重新 serialize）
// 会额外多出几字节，实测 1229 字节的交易被钱包重编码后变成 1233 报 "Transaction too large"。
// 这里留 ~32 字节安全余量，避免边界溢出。
const MAX_TX_BYTES = 1200;

// 仅用于估算交易大小的占位 blockhash（真实 blockhash 在每笔 buildChunkTx 时单独获取，避免过期）
const DUMMY_BLOCKHASH = "11111111111111111111111111111111";

/** 构造单笔交易（内部用，blockhash 由调用方传入） */
function buildTxForChunk(chunk, userPk, platformPk, blockhash) {
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = userPk; // 用户自己付交易费（简单签名，移动端友好）
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 }));
  for (const item of chunk) {
    // 有余额的垃圾币（含强制烧的价值币）先销毁
    if (item.burn) {
      tx.add(createBurnInstruction(item.account, item.mint, userPk, BigInt(item.amountRaw), [], item.program));
    }
    // 关户：租金进平台钱包
    tx.add(createCloseAccountInstruction(item.account, platformPk, userPk, [], item.program));
  }
  return tx;
}

/** 估算单批交易序列化后的字节数（超限返回 Infinity） */
function txSize(chunk, userPk, platformPk) {
  try {
    return buildTxForChunk(chunk, userPk, platformPk, DUMMY_BLOCKHASH)
      .serialize({ requireAllSignatures: false, verifySignatures: false }).length;
  } catch {
    return Infinity;
  }
}

/**
 * 扫描 + 分类 + 分批（不序列化最终交易）。
 * @param {PublicKey} userPk 用户钱包地址
 * @param {PublicKey} platformPk 平台钱包地址（租金进入这里）
 * @param {object} opts { items?: 预扫描结果, forceBurnValuable?: boolean }
 * @returns {{ chunks, perChunkNet, targetCount, skippedValuable, totalRent, totalFee, totalNet }}
 *   chunks: Array<Array<item>>，每项 item 带 { burn, account, mint, amountRaw, program, ... }
 */
async function classifyAndChunk(userPk, platformPk, opts = {}) {
  const items = opts.items || (await buildClassification(userPk));
  const forceBurn = opts.forceBurnValuable === true;
  // 强制烧价值币时，valuable 也纳入 target；否则只处理 empty + burnable
  const targets = items
    .filter((it) => it.category === "empty" || it.category === "burnable" || (forceBurn && it.category === "valuable"))
    .map((it) => ({ ...it, burn: it.category === "burnable" || (forceBurn && it.category === "valuable") }));
  const skippedValuable = forceBurn ? 0 : items.filter((it) => it.category === "valuable").length;
  if (!targets.length) {
    return { chunks: [], perChunkNet: [], targetCount: 0, skippedValuable, totalRent: 0, totalFee: 0, totalNet: 0 };
  }

  // 动态分批：尽量塞满每笔交易（Solana 1232 字节上限），减少签名次数
  const chunks = [];
  let current = [];
  for (const item of targets) {
    const candidate = [...current, item];
    if (current.length > 0 && txSize(candidate, userPk, platformPk) > MAX_TX_BYTES) {
      chunks.push(current);
      current = [item];
    } else {
      current = candidate;
    }
  }
  if (current.length) chunks.push(current);

  const perChunkNet = chunks.map((c) => c.length * (RENT_LAMPORTS - FEE_LAMPORTS));
  const totalRent = targets.length * RENT_LAMPORTS;
  const totalFee = targets.length * FEE_LAMPORTS;
  const totalNet = totalRent - totalFee;

  log(`✍️ 方案A 构造 ${chunks.length} 笔关户交易（${targets.length} 个账户 / 租金 ${(totalRent / 1e9).toFixed(6)} SOL 进平台 / 净额 ${(totalNet / 1e9).toFixed(6)} SOL 将逐笔退回用户）`);

  return { chunks, perChunkNet, targetCount: targets.length, skippedValuable, totalRent, totalFee, totalNet };
}

/**
 * 逐笔构造：取一个 FRESH blockhash，构造单笔关户交易（未签名）。
 * @param {Array<item>} chunk 该批账户
 * @param {PublicKey} userPk 用户钱包（fee payer + 授权人）
 * @param {PublicKey} platformPk 平台钱包（租金进入这里）
 * @returns {{ serialized, accountCount, rentLamports, feeLamports, netLamports, netSol }}
 */
async function buildChunkTx(chunk, userPk, platformPk) {
  const bh = await rpcCall("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const blockhash = bh && bh.value && bh.value.blockhash;
  if (!blockhash) throw new Error("获取 blockhash 失败");

  const tx = buildTxForChunk(chunk, userPk, platformPk, blockhash);
  const accountCount = chunk.length;
  const rentLamports = accountCount * RENT_LAMPORTS;
  const feeLamports = accountCount * FEE_LAMPORTS;
  const netLamports = rentLamports - feeLamports;

  return {
    serialized: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
    accountCount,
    rentLamports,
    feeLamports,
    netLamports,
    netSol: netLamports / 1e9,
  };
}

module.exports = { classifyAndChunk, buildChunkTx };
