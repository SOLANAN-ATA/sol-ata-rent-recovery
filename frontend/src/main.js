import { Buffer } from "buffer";
import { createAppKit } from "@reown/appkit";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { Transaction } from "@solana/web3.js";

// 浏览器没有 Node 的全局 Buffer，但 @reown/appkit-adapter-solana 内部用了裸 Buffer.from，
// 这里注入 polyfill（在其 signTransaction 被调用前设置即可）。
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

const PROJECT_ID = "90e8acbd6ef561c010388421e704871d";

// ===== AppKit 初始化（WalletConnect + 本地钱包统一入口）=====
const modal = createAppKit({
  adapters: [new SolanaAdapter()],
  networks: [solana, solanaDevnet],
  projectId: PROJECT_ID,
  metadata: {
    name: "SOLANA ATA Rent Reclaim",
    description: "Reclaim SOL rent locked in your dead token accounts",
    url: window.location.origin,
    icons: [],
  },
  features: {
    swaps: false,
    onramp: false,
    send: false,
    receive: false,
    email: false,
    socials: false,
    emailShowWallets: false,
    history: false,
    analytics: false,
  },
});

const $ = (id) => document.getElementById(id);

// ===== i18n =====
const I18N = {
  zh: {
    title: "🖊️ SOLANA ATA 租金退回系统",
    hero_tagline: "你钱包里的归零币、垃圾币、貔貅币、空投币，锁着你自己的 SOL 💰",
    hero_p1: "每交易一个不同的币，Solana 钱包会自动开一个代币账户——这是 Solana 公链的特性，链上就锁定约 <b>0.002 SOL</b> 的租金。归零的 meme 币、垃圾币、貔貅币、空投币卖不掉、账户也关不了，这笔钱就卡在链上拿不回。",
    hero_p2: "本系统会帮你：<b>扫描 → 烧掉垃圾币 → 关闭僵尸账户 → 租金自动退回你钱包</b>。每个账户仅收 <b>0.0002 SOL</b>（约租金 <b>10%</b>）手续费，仅需极少量 SOL 作链上手续费。",
    hero_cta: "👇 连接钱包，看看你锁住了多少 SOL",
    hero_note: "本系统代码已在 <a href=\"https://github.com/SOLANAN-ATA/sol-ata-rent-recovery\" target=\"_blank\" rel=\"noopener\">GitHub 开源</a>，欢迎审阅，没有隐瞒，请放心使用。",
    tab_wallet: "🔗 连接钱包退回",
    tab_scan: "🔍 地址查询",
    wallet_label: "连接你的 Solana 钱包（Phantom / Solflare / OKX / TokenPocket / Backpack 等）",
    connect_btn: "连接钱包",
    disconnect_btn: "断开",
    connected_prefix: "已连接：",
    not_connected: "未连接",
    redeem_btn: "扫描并一键退回",
    wallet_warn: "🔐 私钥永不离开你的钱包。每个账户收 0.0002 SOL（约租金 10%），钱包里面仅需预留极少量 SOL（留 0.001 SOL 左右）作链上手续费。",
    scan_label: "钱包地址（公钥）",
    scan_placeholder: "输入任意 Solana 地址，查询可赎回押金的归零币",
    scan_btn: "查询",
    footer_title: "联系我们 / 社区",
    footer_tg: "💬 TG 群组",
    footer_debox: "📱 DEBOX 群组",
    footer_x: "𝕏 X.com",
    footer_web: "🌐 官方网站",
    stat_total: "代币账户总数",
    stat_empty: "可直接关",
    stat_burnable: "系统会自动销毁再退回",
    stat_protected: "受保护",
    stat_valuable: "有价值(跳过)",
    stat_nonredeemable: "不可赎回",
    stat_recoverable: "可回收账户",
    stat_recoverable_sol: "可回收 SOL",
    cat_empty: "可直接关",
    cat_burnable: "系统会自动销毁代币再执行租金赎回操作",
    cat_protected: "受保护",
    cat_valuable: "有价值",
    cat_nonredeemable: "不可赎回",
    th_mint: "代币 Mint",
    th_program: "程序",
    th_balance: "余额",
    th_category: "分类",
    th_recoverable: "可回收(SOL)",
    wr_accounts: "退回账户",
    wr_rent: "退回租金 SOL",
    wr_fee: "平台手续费 SOL",
    wr_broadcast: "已广播交易",
    wr_signatures: "交易签名：",
    wr_net: "净额转回 SOL",
    wr_forward: "✅ 平台已把净额转回你的钱包",
    no_accounts: "未发现代币账户",
    no_reclaimable: "没有可退回租金的账户（0 个可关账户）",
    wallet_balance: "钱包 SOL 余额",
    querying: "查询中…",
    processing: "处理中…",
    connected: "已连接",
    err_no_wallet: "未检测到 Solana 钱包。请安装 Phantom / Solflare / OKX / TokenPocket / Backpack 等。注意：MetaMask 是 ETH 钱包，不支持 Solana。",
    err_connect_fail: "连接失败",
    err_please_connect: "请先连接钱包",
    err_please_addr: "请输入地址",
    err_broadcast_fail: "广播失败: ",
    err_reclaim_fail: "退回失败",
    err_start_fail: "启动失败",
    err_task_fail: "任务失败",
  },
  en: {
    title: "🖊️ SOLANA ATA Rent Reclaim System",
    hero_tagline: "Zeroed coins, junk coins, honeypot coins, airdrop coins in your wallet — they're locking up YOUR SOL 💰",
    hero_p1: "Every time you trade a different token, your Solana wallet auto-opens a token account — that's how the Solana blockchain works. Each account locks ~<b>0.002 SOL</b> in rent. When zeroed meme coins, junk coins, honeypot coins, and airdrop coins can't be sold and the account can't be closed, that SOL is stuck on-chain.",
    hero_p2: "This system helps you: <b>scan → burn junk coins → close zombie accounts → rent auto-returned to your wallet</b>. Each account costs only <b>0.0002 SOL</b> (~<b>10%</b> of rent); you only need a tiny amount of SOL for the on-chain fee.",
    hero_cta: "👇 Connect your wallet and see how much SOL you've locked up",
    hero_note: "The code is <a href=\"https://github.com/SOLANAN-ATA/sol-ata-rent-recovery\" target=\"_blank\" rel=\"noopener\">open sourced on GitHub</a> — feel free to review. No hidden tricks.",
    tab_wallet: "🔗 Connect & Reclaim",
    tab_scan: "🔍 Address Lookup",
    wallet_label: "Connect your Solana wallet (Phantom / Solflare / OKX / TokenPocket / Backpack, etc.)",
    connect_btn: "Connect Wallet",
    disconnect_btn: "Disconnect",
    connected_prefix: "Connected: ",
    not_connected: "Not connected",
    redeem_btn: "Scan & Reclaim",
    wallet_warn: "🔐 Your private key never leaves your wallet. Each account costs 0.0002 SOL (~10% of rent). Just keep a tiny reserve of SOL (~0.001 SOL) for the on-chain fee.",
    scan_label: "Wallet Address (Public Key)",
    scan_placeholder: "Enter any Solana address to find reclaimable rent from zeroed coins",
    scan_btn: "Lookup",
    footer_title: "Contact Us / Community",
    footer_tg: "💬 TG Group",
    footer_debox: "📱 DEBOX Group",
    footer_x: "𝕏 X.com",
    footer_web: "🌐 Official Site",
    stat_total: "Total Token Accounts",
    stat_empty: "Can Close Directly",
    stat_burnable: "Auto-burn & Reclaim",
    stat_protected: "Protected",
    stat_valuable: "Valuable (Skip)",
    stat_nonredeemable: "Non-redeemable",
    stat_recoverable: "Reclaimable Accounts",
    stat_recoverable_sol: "Reclaimable SOL",
    cat_empty: "Can close directly",
    cat_burnable: "System will auto-burn tokens then reclaim rent",
    cat_protected: "Protected",
    cat_valuable: "Valuable",
    cat_nonredeemable: "Non-redeemable",
    th_mint: "Token Mint",
    th_program: "Program",
    th_balance: "Balance",
    th_category: "Category",
    th_recoverable: "Reclaimable (SOL)",
    wr_accounts: "Accounts Reclaimed",
    wr_rent: "Rent Reclaimed (SOL)",
    wr_fee: "Platform Fee (SOL)",
    wr_broadcast: "Tx Broadcast",
    wr_signatures: "Tx Signatures: ",
    wr_net: "Net Returned (SOL)",
    wr_forward: "✅ Net amount returned to your wallet",
    no_accounts: "No token accounts found",
    no_reclaimable: "No reclaimable accounts (0 closable accounts)",
    wallet_balance: "Wallet SOL Balance",
    querying: "Looking up…",
    processing: "Processing…",
    connected: "Connected",
    err_no_wallet: "No Solana wallet detected. Please install Phantom / Solflare / OKX / TokenPocket / Backpack, etc. Note: MetaMask is an ETH wallet and does not support Solana.",
    err_connect_fail: "Connection failed",
    err_please_connect: "Please connect your wallet first",
    err_please_addr: "Please enter an address",
    err_broadcast_fail: "Broadcast failed: ",
    err_reclaim_fail: "Reclaim failed",
    err_start_fail: "Failed to start",
    err_task_fail: "Task failed",
  },
};

let LANG = localStorage.getItem("lang") || "zh";
const t = (key) => (I18N[LANG] && I18N[LANG][key]) || key;

function catLabel(cat) {
  const map = { empty: "cat_empty", burnable: "cat_burnable", protected: "cat_protected", valuable: "cat_valuable", "non-redeemable": "cat_nonredeemable" };
  return map[cat] ? t(map[cat]) : cat;
}

let currentWallet = null;
let lastScanData = null;
let lastWalletBuild = null;

// ===== 渲染函数 =====
function renderSummary(s) {
  return `<div class="summary">
    <div class="stat"><b>${s.total}</b><span>${t("stat_total")}</span></div>
    <div class="stat"><b style="color:var(--green)">${s.empty}</b><span>${t("stat_empty")}</span></div>
    <div class="stat"><b style="color:var(--amber)">${s.burnable}</b><span>${t("stat_burnable")}</span></div>
    <div class="stat"><b style="color:var(--blue)">${s.protected}</b><span>${t("stat_protected")}</span></div>
    <div class="stat"><b style="color:var(--blue)">${s.valuable}</b><span>${t("stat_valuable")}</span></div>
    <div class="stat"><b style="color:var(--red)">${s.nonRedeemable}</b><span>${t("stat_nonredeemable")}</span></div>
    <div class="stat"><b>${s.recoverableCount}</b><span>${t("stat_recoverable")}</span></div>
    <div class="stat"><b style="color:var(--green)">${s.recoverableSol.toFixed(6)}</b><span>${t("stat_recoverable_sol")}</span></div>
  </div>`;
}

function renderTable(items) {
  if (!items || !items.length) return `<div class="card muted">${t("no_accounts")}</div>`;
  let rows = items
    .map((it) => {
      const tag = `<span class="tag ${it.category}">${catLabel(it.category)}</span>`;
      return `<tr>
      <td>${it.mint.slice(0, 8)}…${it.mint.slice(-6)}</td>
      <td>${it.tag === "token2022" ? "Token-2022" : "SPL"}</td>
      <td>${it.amountUi}</td>
      <td>${tag}${it.reason ? `<div class="muted">${it.reason}</div>` : ""}</td>
      <td>${it.category === "empty" || it.category === "burnable" ? (it.recoverableLamports / 1e9).toFixed(6) : "—"}</td>
    </tr>`;
    })
    .join("");
  return `<div class="card"><table>
    <thead><tr><th>${t("th_mint")}</th><th>${t("th_program")}</th><th>${t("th_balance")}</th><th>${t("th_category")}</th><th>${t("th_recoverable")}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function renderScanResult(data) {
  lastScanData = data;
  const balCard = `<div class="card">
    <div style="font-size:13px;color:var(--dim);margin-bottom:8px">${t("wallet_balance")}</div>
    <div style="font-size:28px;color:var(--blue);font-weight:700">${data.balanceSol.toFixed(6)} SOL</div>
  </div>`;
  $("scanResult").innerHTML = balCard + renderSummary(data.summary) + renderTable(data.items);
}

function renderWalletResult(build) {
  lastWalletBuild = build;
  $("walletResult").innerHTML = `<div class="card">
    <div class="summary">
      <div class="stat"><b>${build.targetCount}</b><span>${t("wr_accounts")}</span></div>
      <div class="stat"><b style="color:var(--blue)">${build.rentSol.toFixed(6)}</b><span>${t("wr_rent")}</span></div>
      <div class="stat"><b style="color:var(--amber)">${build.feeSol.toFixed(6)}</b><span>${t("wr_fee")}</span></div>
      <div class="stat"><b style="color:var(--green)">${build.netSol.toFixed(6)}</b><span>${t("wr_net")}</span></div>
    </div>
    <div class="muted">${t("wr_forward")}${build.forwardSig ? " · " + build.forwardSig.slice(0, 10) + "…" : ""}</div>
  </div>`;
}

function appendLog(container, lines) {
  for (const l of lines) {
    const div = document.createElement("div");
    div.textContent = l;
    container.appendChild(div);
  }
  container.scrollTop = container.scrollHeight;
}

async function runJob(url, body, logbox, onDone) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const startData = await res.json();
  if (!res.ok) throw new Error(startData.error || t("err_start_fail"));
  const jobId = startData.jobId;
  let after = 0;
  await new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const pr = await fetch(`/api/progress/${jobId}?after=${after}`);
        const pd = await pr.json();
        if (pd.logs && pd.logs.length) {
          appendLog(logbox, pd.logs);
          after = pd.total;
        }
        if (pd.status === "done") { onDone(pd.result); resolve(); return; }
        if (pd.status === "error") { reject(new Error(pd.error || t("err_task_fail"))); return; }
        setTimeout(tick, 700);
      } catch (e) { reject(e); }
    };
    tick();
  });
}

// ===== i18n 应用 =====
function applyLang() {
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.id === (LANG === "zh" ? "langZh" : "langEn")));
  const addrEl = $("walletAddr");
  if (currentWallet) {
    addrEl.textContent = currentWallet.slice(0, 8) + "…" + currentWallet.slice(-6);
  } else {
    addrEl.textContent = t("not_connected");
  }
  if (lastScanData) renderScanResult(lastScanData);
  if (lastWalletBuild) renderWalletResult(lastWalletBuild);
}

$("langZh").onclick = () => { LANG = "zh"; localStorage.setItem("lang", "zh"); applyLang(); };
$("langEn").onclick = () => { LANG = "en"; localStorage.setItem("lang", "en"); applyLang(); };

// tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((x) => x.classList.remove("active"));
    tab.classList.add("active");
    $("panel-" + tab.dataset.t).classList.add("active");
  };
});

// ===== 地址查询 =====
$("scanBtn").onclick = async () => {
  const addr = $("scanAddr").value.trim();
  $("scanErr").textContent = "";
  $("scanResult").innerHTML = "";
  const logbox = $("scanLog");
  logbox.innerHTML = "";
  logbox.style.display = "block";
  if (!addr) { $("scanErr").textContent = t("err_please_addr"); return; }
  $("scanBtn").disabled = true;
  $("scanBtn").textContent = t("querying");
  try {
    await runJob("/api/scan", { address: addr }, logbox, (data) => {
      renderScanResult(data);
    });
  } catch (e) {
    $("scanErr").textContent = e.message;
  } finally {
    $("scanBtn").disabled = false;
    $("scanBtn").textContent = t("scan_btn");
  }
};

// ===== 连接钱包（AppKit / WalletConnect）=====
const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

function updateWalletUI(connected) {
  const addrEl = $("walletAddr");
  if (connected && currentWallet) {
    addrEl.textContent = currentWallet.slice(0, 8) + "…" + currentWallet.slice(-6);
    $("connectBtn").disabled = true;
    $("connectBtn").textContent = t("connected");
  } else {
    addrEl.textContent = t("not_connected");
    $("connectBtn").disabled = false;
    $("connectBtn").textContent = t("connect_btn");
  }
}

// 订阅账户状态（连接/断开/换钱包都触发）
modal.subscribeAccount((state) => {
  if (state.isConnected && state.address) {
    currentWallet = state.address;
    updateWalletUI(true);
  } else {
    currentWallet = null;
    updateWalletUI(false);
    $("walletResult").innerHTML = "";
  }
}, "solana");

$("connectBtn").onclick = async () => {
  $("walletErr").textContent = "";
  try {
    await modal.open({ view: "Connect" });
  } catch (e) {
    $("walletErr").textContent = e.message || t("err_connect_fail");
  }
};

$("disconnectBtn").onclick = async () => {
  try { await modal.disconnect("solana"); } catch {}
};

$("redeemWalletBtn").onclick = async () => {
  $("walletErr").textContent = "";
  $("walletResult").innerHTML = "";
  const logbox = $("walletLog");
  logbox.innerHTML = "";
  logbox.style.display = "block";
  if (!currentWallet) { $("walletErr").textContent = t("err_please_connect"); return; }
  const provider = modal.getProvider("solana");
  if (!provider || typeof provider.signTransaction !== "function") {
    $("walletErr").textContent = t("err_no_wallet");
    return;
  }
  $("redeemWalletBtn").disabled = true;
  $("redeemWalletBtn").textContent = t("processing");
  try {
    const build = await fetch("/api/build-redeem-tx", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: currentWallet }),
    }).then((r) => r.json());
    if (build.error) throw new Error(build.error);
    if (!build.targetCount) {
      $("walletResult").innerHTML = `<div class="card muted">${t("no_reclaimable")}</div>`;
      return;
    }
    const sigs = [];
    for (let i = 0; i < build.txs.length; i++) {
      const tx = build.txs[i];
      const txObj = Transaction.from(b64ToBytes(tx.serialized));
      const signed = await provider.signTransaction(txObj);
      const b64 = signed.serialize().toString("base64");
      const sub = await fetch("/api/submit-tx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx: b64 }),
      }).then((r) => r.json());
      if (sub.error) throw new Error(t("err_broadcast_fail") + sub.error);
      sigs.push(sub.signature);
    }
    // 方案A：广播后请求平台转净额
    let forwardSig = null;
    if (build.requestId) {
      const fw = await fetch("/api/forward", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: build.requestId }),
      }).then((r) => r.json());
      if (fw.error) throw new Error(fw.error);
      forwardSig = fw.signature;
    }
    renderWalletResult({ ...build, sigs, forwardSig });
  } catch (e) {
    $("walletErr").textContent = e.message || t("err_reclaim_fail");
  } finally {
    $("redeemWalletBtn").disabled = false;
    $("redeemWalletBtn").textContent = t("redeem_btn");
  }
};

// 初始应用语言
applyLang();
