/**
 * SOLANA ATA 租金退回系统 — 签名模式交易构造（方案 A）
 *
 * 方案 A：关户租金先进平台钱包 → 平台转净额（租金 - 手续费）给用户。
 * 用户只签一笔简单交易（销毁 + 关户，租金进平台地址），用户自己是 fee payer，
 * 无需部分签名 → 移动端钱包（WalletConnect）友好。
 */
const { Transaction, ComputeBudgetProgram } = require("@solana/web3.js");
const { createBurnInstruction, createCloseAccountInstruction } = require("@solana/spl-token");
const { rpcCall } = require("./solana");
const { buildClassification } = require("./scan");
const { log } = require("./log");
const { RENT_LAMPORTS, FEE_LAMPORTS } = require("../config");

// 每笔交易最多打包的关户数（控制在 Solana 1232 字节交易大小限制内）
const MAX_CLOSE_PER_TX = 6;

/**
 * 构造方案 A 的关户交易（未签名，用户钱包签名）
 * @param {PublicKey} userPk 用户钱包地址（fee payer + 授权人）
 * @param {PublicKey} platformPk 平台钱包地址（租金进入这里，之后平台转净额给用户）
 * @param {object} opts { items?: 预扫描结果 }
 * @returns {{ txs, targetCount, rentLamports, feeLamports, netLamports, rentSol, feeSol, netSol }}
 */
async function buildRedeemTransactions(userPk, platformPk, opts = {}) {
  const items = opts.items || (await buildClassification(userPk));
  const targets = items.filter((it) => it.category === "empty" || it.category === "burnable");
  if (!targets.length) {
    return { txs: [], targetCount: 0, rentLamports: 0, feeLamports: 0, netLamports: 0, rentSol: 0, feeSol: 0, netSol: 0 };
  }

  const bh = await rpcCall("getLatestBlockhash", [{ commitment: "finalized" }]);
  const blockhash = bh && bh.value && bh.value.blockhash;
  if (!blockhash) throw new Error("获取 blockhash 失败");

  // 分批
  const chunks = [];
  for (let i = 0; i < targets.length; i += MAX_CLOSE_PER_TX) {
    chunks.push(targets.slice(i, i + MAX_CLOSE_PER_TX));
  }

  const txs = [];
  for (const chunk of chunks) {
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPk; // 用户自己付交易费（简单签名，移动端友好）
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 }));

    for (const item of chunk) {
      // 有余额的垃圾币先销毁
      if (item.category === "burnable") {
        tx.add(createBurnInstruction(item.account, item.mint, userPk, BigInt(item.amountRaw), [], item.program));
      }
      // 关户：租金进平台钱包
      tx.add(createCloseAccountInstruction(item.account, platformPk, userPk, [], item.program));
    }

    txs.push({
      serialized: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
      accountCount: chunk.length,
    });
  }

  const totalRent = targets.length * RENT_LAMPORTS;
  const totalFee = targets.length * FEE_LAMPORTS;
  const totalNet = totalRent - totalFee;

  log(`✍️ 方案A 构造 ${txs.length} 笔关户交易（${targets.length} 个账户 / 租金 ${(totalRent / 1e9).toFixed(6)} SOL 进平台 / 净额 ${(totalNet / 1e9).toFixed(6)} SOL 将退回用户）`);

  return {
    txs,
    targetCount: targets.length,
    rentLamports: totalRent,
    feeLamports: totalFee,
    netLamports: totalNet,
    rentSol: totalRent / 1e9,
    feeSol: totalFee / 1e9,
    netSol: totalNet / 1e9,
  };
}

module.exports = { buildRedeemTransactions };
