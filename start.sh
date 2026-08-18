#!/usr/bin/env bash
# SOLANA ATA 租金退回系统 — 安全启动脚本
# 私钥不落盘到 config.js：从环境变量或 .env（600 权限）读取
set -e
cd "$(dirname "$0")"

# 加载 .env（若存在）
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# 校验必需私钥
if [ -z "$FEE_PAYER_SECRET_KEY" ]; then
  echo "错误：缺少 FEE_PAYER_SECRET_KEY（平台手续费支付钱包私钥）" >&2
  echo "请设置环境变量，或在 .env 中配置（chmod 600 .env）" >&2
  exit 1
fi

export FEE_PAYER_SECRET_KEY

exec node server.js
