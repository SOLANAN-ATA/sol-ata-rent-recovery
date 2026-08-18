# SOLANA ATA 租金退回系统（sol-ata-rent-recovery）

扫描任意 Solana 钱包里的代币账户，退回归零币 ATA 锁定的租金（每个账户约 0.00203928 SOL）。

> 原名「SOL 归零币回收系统」。本版新增**签名模式**：用户连接钱包自己签名，平台代付交易费，不再需要提交私钥。

## 功能

1. **地址查询**（只读）：输入公钥，列出所有代币账户并分类，汇总可回收租金。
2. **签名退回**（推荐）：连接 Phantom/Solflare 钱包，一键退回租金，平台代付手续费，从租金中扣 0.0002 SOL/账户（约 10%）。

## 分类规则

| 类别 | 说明 |
|------|------|
| `empty` | 余额 0，直接关户退回租金 |
| `burnable` | 余额 > 0 但归零（无价值），先销毁再关户 |
| `protected` | 受保护代币（SOL/USDT/USDC 等），永不销毁 |
| `valuable` | 余额 > 0 且还有价值（Jupiter 报价 ≥ 阈值），跳过 |
| `non-redeemable` | close-authority / non-transferable / frozen，跳过 |

## 手续费模型（签名模式）

- 每个账户收 **0.0002 SOL**（约租金的 10%），在关户交易里一并扣除：先退租给用户 → 再转手续费给平台。
- 平台作为 fee payer 代付交易费（约 0.000005 SOL/笔），**0 SOL 用户也能退回租金**。

## 运行

```bash
cd sol-zero-recovery
npm install
./start.sh          # 私钥从 .env 读取（chmod 600）
# 打开 http://localhost:3725
```

- 收款/手续费地址在 `config.js` 的 `DONATION_ADDRESS` 中配置。
- 平台手续费支付钱包用 `FEE_PAYER_SECRET_KEY`。
- 私钥存 `.env`（`FEE_PAYER_SECRET_KEY=xxx`，base58），不落盘到 config.js。

## 安全提示

- 签名模式：私钥永不离开用户钱包，平台只代付交易费。
- 服务默认只监听 `127.0.0.1`。上公网前需：HTTPS、鉴权、限流、RPC key 迁 env。
