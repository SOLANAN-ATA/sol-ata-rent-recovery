/**
 * SOLANA ATA 租金退回系统 — 签名模式交易构造
 *
 * 用户连接钱包（Phantom/Solflare）签名，平台作为 fee payer 代付交易费，
 * 费用从收回的租金中扣除（同一笔交易内：先关户退租给用户 → 再转手续费给平台）。
 * 用户全程不暴露私钥。
 */
const { Transaction, ComputeBudgetProgram, SystemProgram } = require("@solana/web3.js");
const { createBurnInstruction, createCloseAccountInstruction } = require("@solana/spl-token");
const { rpcCall } = require("./solana");
const { buildClassification } = require("./scan");
const { log } = require("./log");
const { RENT_LAMPORTS, FEE_LAMPORTS } = require("../config");

// 每笔交易最多打包的关户数（控制在 Solana 1232 字节交易大小限制内；实测 10 会超，6 安全）
const MAX_CLOSE_PER_TX = 6;

/**
 * 构造签名模式下的赎回交易（部分签名，fee payer = 平台）
 * @param {PublicKey} userPk 用户钱包地址（连接的钱包）
 * @param {Keypair} feePayerKp 平台代付手续费的钱包
 * @param {PublicKey} feeAddress 手续费收款地址
 * @param {object} opts { items?: 预扫描结果 }
 * @returns {{ txs: Array, targetCount, feeLamports, rentLamports, feeSol, rentSol }}
 */
async function buildRedeemTransactions(userPk, feePayerKp, feeAddress, opts = {}) {
  const items = opts.items || (await buildClassification(userPk));
  const targets = items.filter((it) => it.category === "empty" || it.category === "burnable");
  if (!targets.length) {
    return { txs: [], targetCount: 0, feeLamports: 0, rentLamports: 0, feeSol: 0, rentSol: 0 };
  }

  const bh = await rpcCall("getLatestBlockhash", [{ commitment: "finalized" }]);
  const blockhash = bh && bh.value && bh.value.blockhash;
  if (!blockhash) throw new Error("获取 blockhash 失败");

  // 分批：每批最多 MAX_CLOSE_PER_TX 个账户
  const chunks = [];
  for (let i = 0; i < targets.length; i += MAX_CLOSE_PER_TX) {
    chunks.push(targets.slice(i, i + MAX_CLOSE_PER_TX));
  }

  const txs = [];
  let totalFee = 0;
  let totalRent = 0;

  for (const chunk of chunks) {
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = feePayerKp.publicKey;
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 }));

    for (const item of chunk) {
      // 有余额的垃圾币先销毁
      if (item.category === "burnable") {
        tx.add(createBurnInstruction(item.account, item.mint, userPk, BigInt(item.amountRaw), [], item.program));
      }
      // 关户：租金退给用户本人
      tx.add(createCloseAccountInstruction(item.account, userPk, userPk, [], item.program));
    }

    // 手续费：从用户刚收到的租金里扣除（关户指令在前、此转账在后，同交易内顺序执行有效）
    const chunkFee = chunk.length * FEE_LAMPORTS;
    if (chunkFee > 0) {
      tx.add(SystemProgram.transfer({ fromPubkey: userPk, toPubkey: feeAddress, lamports: chunkFee }));
    }

    // 平台作为 fee payer 部分签名
    tx.partialSign(feePayerKp);

    txs.push({
      serialized: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
      accountCount: chunk.length,
      feeLamports: chunkFee,
      rentLamports: chunk.length * RENT_LAMPORTS,
    });
    totalFee += chunkFee;
    totalRent += chunk.length * RENT_LAMPORTS;
  }

  log(`✍️ 构造 ${txs.length} 笔赎回交易（${targets.length} 个账户 / 手续费 ${(totalFee / 1e9).toFixed(6)} SOL）`);

  return {
    txs,
    targetCount: targets.length,
    feeLamports: totalFee,
    rentLamports: totalRent,
    feeSol: totalFee / 1e9,
    rentSol: totalRent / 1e9,
  };
}

module.exports = { buildRedeemTransactions };
