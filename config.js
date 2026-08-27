/**
 * SOLANA ATA 租金退回系统 — 配置
 */

// 归集冷钱包地址：热钱包（FEE_PAYER）余额超 0.1 SOL 时，多余 SOL 归集到这里（无私钥，冷存储，也是公开捐赠地址）
const DONATION_ADDRESS = "5aqXs2FFumQkyN8SBYf3EGV7PwLKAHgPwKPdtQQN5MAK";

// RPC 端点（轮换 + fallback）
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const RPCS = [
  // Helius 优先（有 API key，最稳）；publicnode / 官方 / Ankr 作兜底（公开节点对 getTokenAccountsByOwner 限流较严，仅兜底）
  HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` : "",
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
  "https://rpc.ankr.com/solana",
].filter(Boolean);

const PORT = process.env.PORT || 3725;

// 标准 SPL ATA 的 rent-exempt 租金（165 字节），仅作兜底参考值。
// 实际租金以账户真实 lamports 为准（见 lib/solana.js getTokenAccounts），
// Token-2022 带扩展的账户（如 170 字节）租金更高（2074080），不能写死这一个值。
const RENT_LAMPORTS = 2039280;

// 签名模式：每个账户收的手续费（lamports）。0.0002 SOL ≈ 租金的 10%
const FEE_LAMPORTS = 200000;

// 受保护代币：永不销毁（硬保证，不依赖报价）。可自行追加。
const PROTECTED_MINTS = [
  "So11111111111111111111111111111111111111112", // Wrapped SOL
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", // PYUSD (PayPal)
  "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA", // USDS (Sky)
  "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr", // EURC
];

// 价值检测阈值：代币可换回的 SOL ≥ 该值则判「有价值」，跳过不销毁
// 0.001 SOL = 1,000,000 lamports
const VALUE_THRESHOLD_LAMPORTS = 1000000n;

// ===== 签名模式：平台手续费支付钱包（fee payer）=====
// 用户连接钱包签名时，平台代付交易费，让 0 SOL 用户也能退回租金。
// 私钥存 .env（FEE_PAYER_SECRET_KEY），勿硬编码。
const FEE_PAYER_SECRET_KEY = process.env.FEE_PAYER_SECRET_KEY || "";

module.exports = {
  DONATION_ADDRESS,
  RPCS,
  PORT,
  RENT_LAMPORTS,
  FEE_LAMPORTS,
  PROTECTED_MINTS,
  VALUE_THRESHOLD_LAMPORTS,
  FEE_PAYER_SECRET_KEY,
};
