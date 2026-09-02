/**
 * Solata TG bot 多语言模块（i18n）
 *
 * 加一门语言只需两步：
 *   1. 在下方 translations 里加一个语言对象，key 与 zh/en 完全对齐；
 *   2. 语言代码会自动被识别（Telegram 的 message.from.language_code，
 *      如 "zh-hans"→zh、"en-US"→en、"tr"→tr、"ko"→ko…），无需改别处。
 *
 * 语言检测：取 language_code 的 base（去 - 或 _ 后缀），命中 SUPPORTED 就用，
 * 否则回退 DEFAULT_LANG。
 */
const translations = {
  zh: {
    welcome:
      "👋 把任意 Solana 钱包地址发给我，我帮你查有多少死账户租金能退回。\n\n" +
      "💡 每交易一个不同的币，Solana 会自动开一个代币账户，每个锁约 0.002 SOL 租金。" +
      "归零币/垃圾币/貔貅币卖不掉、账户也关不了，这笔钱就卡在链上。\n\n" +
      "💰 退回只需付 10% 手续费（每账户 0.0002 SOL）。\n\n" +
      "👇 直接粘贴地址（群里 @我 也行）：",
    invalid:
      "⚠️ 这看起来不是有效的 Solana 地址。请粘贴以 1-9 / A-Z 开头的 32~44 位地址。",
    none:
      "😕 这个地址没有可退回租金的死账户。\n\n" +
      "代币账户总数：{total}，可回收：0。",
    success:
      "💰 这个地址锁了 <b>{sol} SOL</b> 租金！\n\n" +
      "🔹 可退账户：{count} 个\n" +
      "🔹 手续费：{fee} SOL（10%）\n" +
      "🔹 预计到账：<b>{net} SOL</b>\n\n" +
      "👉 连接钱包一键退回：",
    reclaim_btn: "🚀 立即退回",
    error: "❌ 查询失败，请稍后重试。\n{err}",
    stats:
      "📊 查询统计\n\n" +
      "🔹 累计查询：{total} 次\n" +
      "🔹 今日查询：{today} 次\n" +
      "🔹 累计发现可退账户：{accounts} 个\n" +
      "🔹 累计可退租金：{sol} SOL",
  },
  en: {
    welcome:
      "👋 Send me any Solana wallet address and I'll check how much locked rent you can reclaim.\n\n" +
      "💡 Every distinct token you trade opens a token account on Solana, each locking ~0.002 SOL in rent. " +
      "Dead/rug/honeypot coins can't be sold and the account can't be closed — that SOL is stuck on-chain.\n\n" +
      "💰 Reclaiming costs just a 10% fee (0.0002 SOL per account).\n\n" +
      "👇 Paste an address (or @ me in a group):",
    invalid:
      "⚠️ That doesn't look like a valid Solana address. Please paste a 32–44 character address starting with 1-9 / A-Z.",
    none:
      "😕 This address has no reclaimable dead accounts.\n\n" +
      "Token accounts: {total}, reclaimable: 0.",
    success:
      "💰 This address has <b>{sol} SOL</b> locked in rent!\n\n" +
      "🔹 Reclaimable accounts: {count}\n" +
      "🔹 Fee: {fee} SOL (10%)\n" +
      "🔹 Estimated return: <b>{net} SOL</b>\n\n" +
      "👉 Connect your wallet to reclaim:",
    reclaim_btn: "🚀 Reclaim now",
    error: "❌ Query failed, please try again later.\n{err}",
    stats:
      "📊 Stats\n\n" +
      "🔹 Total queries: {total}\n" +
      "🔹 Today: {today}\n" +
      "🔹 Reclaimable accounts found: {accounts}\n" +
      "🔹 Reclaimable rent: {sol} SOL",
  },
};

const DEFAULT_LANG = "zh"; // 未知语言兜底（Telegram 正常都会带 language_code）
const SUPPORTED = Object.keys(translations);

/** 语言代码 → 支持的语言 id（zh/en/tr/ko/ja/vi/ru…） */
function resolveLang(langCode) {
  if (!langCode) return DEFAULT_LANG;
  const lc = String(langCode).toLowerCase();
  const base = lc.split("-")[0].split("_")[0];
  return SUPPORTED.includes(base) ? base : DEFAULT_LANG;
}

/** 取文案，支持 {key} 插值；缺失回退默认语言，再回退 key 本身 */
function t(lang, key, params = {}) {
  let str =
    (translations[lang] && translations[lang][key]) ||
    translations[DEFAULT_LANG][key] ||
    key;
  for (const [k, v] of Object.entries(params)) {
    str = str.split(`{${k}}`).join(String(v));
  }
  return str;
}

/** 从 Telegram message 检测语言 */
function detectLang(msg) {
  return resolveLang(msg && msg.from && msg.from.language_code);
}

module.exports = { t, detectLang, resolveLang, translations, SUPPORTED, DEFAULT_LANG };
