/**
 * sol-zero-recovery — 转账互斥锁（全局单例）
 *
 * forward / retryPendingForwards / 归集 / 批量退回 都动平台热钱包（转 90% 净额 / 手续费），
 * 必须串行化，防止并发对同一批资金重复转账（重复支付 = 平台损失）。
 * 单例：多个 require 返回同一把锁（Node 模块缓存），server.js 与 lib/batchRedeem.js 共享。
 */
let lock = Promise.resolve();

async function withTransferLock(fn) {
  let release;
  const prev = lock;
  lock = new Promise((r) => { release = r; });
  await prev; // 等上一个持锁者释放
  try {
    return await fn();
  } finally {
    release();
  }
}

module.exports = { withTransferLock };
