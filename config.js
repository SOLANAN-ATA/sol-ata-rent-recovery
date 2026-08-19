/**
 * SOLANA ATA 租金退回系统 — 配置
 */

// 归集冷钱包地址：热钱包（FEE_PAYER）余额超 0.1 SOL 时，多余 SOL 归集到这里（无私钥，冷存储，也是公开捐赠地址）
const DONATION_ADDRESS = "5aqXs2FFumQkyN8SBYf3EGV7PwLKAHgPwKPdtQQN5MAK";

// RPC 端点（轮换 + fallback）
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const RPCS = [
  "https://solana-rpc.publicnode.com",
  HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` : "",
].filter(Boolean);

const PORT = process.env.PORT || 3725;

// 每个代币账户的租金（ATA rent-exempt 最低值）
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
