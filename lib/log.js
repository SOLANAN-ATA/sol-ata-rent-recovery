/**
 * sol-zero-recovery — 日志 / 进度（全局 pub/sub）
 *
 * log() 同时：1) 打印到终端  2) 推送给所有订阅者（用于网页实时进度）
 */
const listeners = new Set();

function ts() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function log(msg) {
  const line = `[${ts()}] ${msg}`;
  console.log(line);
  for (const l of listeners) {
    try { l(line); } catch {}
  }
}

/** 订阅日志，返回取消订阅函数 */
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

module.exports = { log, subscribe };
