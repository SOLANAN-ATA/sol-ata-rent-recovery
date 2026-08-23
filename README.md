# Solata — SOLANA ATA 租金退回

拿回你钱包里被锁住的 SOL。

在 Solana 链上，每交易一个新代币，钱包会自动创建一个「代币账户（ATA）」，每个锁定约 **0.00203928 SOL** 作为租金押金。当你买的 meme 币、土狗币、归零币跌到归零后，币卖不出去、账户也关不掉，这笔 SOL 就永久卡在链上。

Solata 帮你扫描、销毁归零币、关闭账户，把租金退回来。

🌐 在线使用：**https://solata.top**

## 能做什么

- **查询**：输入钱包地址，列出所有代币账户，汇总能退回多少租金
- **关闭空账户**：余额为 0 的僵尸账户，直接关户退租
- **销毁归零币**：有余额的垃圾币先销毁再关户（受保护代币永不销毁）
- **持币账户也能退**：不只退空账户，有余额的账户同样能处理

## 核心特性

- 🔒 **私钥永不离开钱包**：连接 Phantom / Solflare / OKX 等钱包自己签名，平台拿不到私钥
- 💰 **只收 10% 手续费**：每账户 0.0002 SOL（约租金的 10%），**退成功才收费**，不成功分文不收
- 🎁 **邀请返佣**：好友用你的链接（`?ref=地址`）退租金，你返 50% 手续费
- 🤖 **TG 机器人**：地址发给 [@solata_rent_bot](https://t.me/solata_rent_bot)，秒回「锁了多少 SOL」
- 🌍 **中英双语**

## 受保护代币

SOL / USDT / USDC / PYUSD / USDS / EURC 永不销毁。

其余有余额的代币账户会被关闭并退回租金，**赎回前请先自行转走有价值的币**。

## 手续费

- 每账户 **0.0002 SOL**（约租金的 10%），从退回的租金中扣除
- 链上交易费（约 0.000005 SOL/签名）由用户自付，退回前钱包需留有极少量 SOL
- 邀请返佣：返 50% 手续费给邀请人

## 安全

- ✅ 代码开源（MIT），欢迎审计
- ✅ 私钥不出钱包，用户自己签名
- ✅ 不碰你的资产：只关闭代币账户退回租金，不转走 SOL / USDT 等资产本身

## 链接

- 🌐 官网：https://solata.top
- 🤖 TG 机器人：[@solata_rent_bot](https://t.me/solata_rent_bot)
- 💬 TG 群组：https://t.me/SOLANA_ATA_TEAM
- 📱 DEBOX 群组：https://m.debox.pro/group?id=ztuvet6y
- 𝕏 X：https://x.com/mingzhu038

## 技术栈

Node.js · Express · Solana Web3.js · Reown AppKit · Vite

## 本地运行（开发者 / 审计）

```bash
git clone https://github.com/SOLANAN-ATA/sol-ata-rent-recovery.git
cd sol-ata-rent-recovery
npm install
npm run build
./start.sh        # 私钥从 .env 读取（chmod 600）
```

服务默认只监听本机 3725 端口。

## License

MIT © SOLANAN-ATA
