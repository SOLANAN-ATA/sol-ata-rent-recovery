/**
 * sol-zero-recovery — 扫描 + 分类
 *
 * 分类：
 *   - empty          : 余额 0，可直接关户赎回押金
 *   - burnable       : 余额 > 0 但归零（无价值），先销毁再关户
 *   - protected      : 受保护代币（SOL/USDT/USDC 等），永不销毁
 *   - valuable       : 余额 > 0 且还有价值（Jupiter 报价 ≥ 阈值），跳过
 *   - non-redeemable : 不可赎回（close-authority / non-transferable / frozen）
 */
const { PublicKey } = require("@solana/web3.js");
const {
  unpackMint,
  getExtensionTypes,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
} = require("@solana/spl-token");
const { getTokenAccounts, getAccountInfo, getBalance } = require("./solana");
const { log } = require("./log");
const { RENT_LAMPORTS, PROTECTED_MINTS } = require("../config");

const PROTECTED_SET = new Set(PROTECTED_MINTS);

// 扫描/分类并发数（RPC 请求受全局 150ms 节流，实际吞吐由节流决定）
const SCAN_CONCURRENCY = 100;

const mintCache = new Map();

/** 分析 mint 的 Token-2022 扩展（标准 SPL 无扩展，直接跳过） */
async function analyzeMint(mintPk, isToken2022) {
  const key = mintPk.toBase58();
  if (mintCache.has(key)) return mintCache.get(key);

  let meta;
  if (!isToken2022) {
    meta = { closeAuthority: null, freezeAuthority: null, permanentDelegate: null, nonTransferable: false };
  } else {
    try {
      // 只抓一次原始账户数据，unpackMint 解析出 closeAuthority / permanentDelegate / 扩展
      const acct = await getAccountInfo(mintPk);
      if (!acct) {
        meta = { closeAuthority: null, freezeAuthority: null, permanentDelegate: null, nonTransferable: false, error: "mint 不存在" };
      } else {
        const info = {
          data: acct.data,
          owner: new PublicKey(acct.owner),
          lamports: acct.lamports,
          executable: false,
        };
        const mint = unpackMint(mintPk, info, TOKEN_2022_PROGRAM_ID);
        const types = mint.tlvData ? getExtensionTypes(mint.tlvData) : [];
        meta = {
          closeAuthority: mint.closeAuthority || null,
          freezeAuthority: mint.freezeAuthority || null,
          permanentDelegate: mint.permanentDelegate || null,
          nonTransferable: types.includes(ExtensionType.NonTransferable),
        };
      }
    } catch (e) {
      meta = { closeAuthority: null, freezeAuthority: null, permanentDelegate: null, nonTransferable: false, error: e.message };
    }
  }
  mintCache.set(key, meta);
  return meta;
}

/** 并发限制工具：Promise 池 */
function mapLimit(arr, limit, fn) {
  const out = new Array(arr.length);
  let idx = 0;
  const worker = async () => {
    while (idx < arr.length) {
      const i = idx++;
      out[i] = await fn(arr[i], i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, arr.length) }, worker);
  return Promise.all(workers).then(() => out);
}

async function classifyOne(a) {
  const meta = await analyzeMint(a.mint, a.tag === "token2022");
  const empty = a.amountRaw === "0";
  let category;
  let reason = null;
  let valueLamports = null;

  if (meta.closeAuthority) {
    category = "non-redeemable";
    reason = "close-authority：项目方设了关户权限";
  } else if (empty) {
    category = "empty";
  } else if (PROTECTED_SET.has(a.mintStr)) {
    category = "protected";
    reason = "受保护代币（SOL/USDT/USDC 等），不销毁";
  } else if (meta.nonTransferable) {
    category = "non-redeemable";
    reason = "non-transferable：不可转让/不可销毁";
  } else if (a.state === "frozen") {
    category = "non-redeemable";
    reason = "frozen：账户被冻结";
  } else {
    // 不做价值检测：有余额的币一律归为可销毁（页面已提示客户先自行转走有价值的币）
    category = "burnable";
  }
  return { ...a, category, reason, meta, valueLamports };
}

/** 内部版：返回带 PublicKey 的分类结果（供 redeem 使用） */
async function buildClassification(ownerPk) {
  log("🔍 查询代币账户中…");
  const accounts = await getTokenAccounts(ownerPk);
  log(`🔍 共发现 ${accounts.length} 个代币账户`);
  // 1. 预分析所有唯一 mint（并行去重，避免同一 mint 重复请求）
  const uniqueMints = [...new Set(accounts.map((a) => `${a.mintStr}|${a.tag}`))];
  log(`🧬 分析 ${uniqueMints.length} 个唯一 mint 的扩展字段…`);
  await mapLimit(uniqueMints, SCAN_CONCURRENCY, async (key) => {
    const [mintStr, tag] = key.split("|");
    await analyzeMint(new PublicKey(mintStr), tag === "token2022");
  });
  // 2. 分类（analyzeMint 命中缓存，价值检测带熔断）
  const items = await mapLimit(accounts, SCAN_CONCURRENCY, classifyOne);
  return items;
}

/** 对外版：返回 JSON 安全（字符串）的扫描结果 */
async function scanWallet(ownerPk) {
  const [items, balanceLamports] = await Promise.all([
    buildClassification(ownerPk),
    getBalance(ownerPk),
  ]);
  const summary = {
    total: items.length,
    empty: 0,
    burnable: 0,
    protected: 0,
    valuable: 0,
    nonRedeemable: 0,
    recoverableCount: 0,
    recoverableLamports: 0,
    recoverableSol: 0,
  };
  const list = items.map((it) => {
    const recoverable = it.category === "empty" || it.category === "burnable";
    if (summary[it.category] !== undefined) summary[it.category]++;
    if (recoverable) {
      summary.recoverableCount++;
      summary.recoverableLamports += RENT_LAMPORTS;
    }
    return {
      mint: it.mintStr,
      account: it.account.toBase58(),
      tag: it.tag,
      amountUi: it.amountUi,
      decimals: it.decimals,
      state: it.state,
      category: it.category,
      reason: it.reason,
      valueLamports: it.valueLamports ? it.valueLamports.toString() : null,
      closeAuthority: it.meta.closeAuthority ? it.meta.closeAuthority.toBase58() : null,
      permanentDelegate: it.meta.permanentDelegate ? it.meta.permanentDelegate.toBase58() : null,
      recoverableLamports: recoverable ? RENT_LAMPORTS : 0,
    };
  });
  summary.recoverableSol = summary.recoverableLamports / 1e9;
  return {
    address: ownerPk.toBase58(),
    balanceLamports,
    balanceSol: balanceLamports / 1e9,
    summary,
    items: list,
  };
}

module.exports = { scanWallet, buildClassification, analyzeMint, NATIVE_MINT: null };
