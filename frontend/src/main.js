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
    title: "🖊️ Solana 退租金 - 拿回你钱包里锁住的 SOL",
    hero_tagline: "你钱包里的归零币、垃圾币、貔貅币、空投币，锁着你自己的 SOL 💰",
    hero_p1: "每交易一个不同的币，Solana 钱包会自动开一个代币账户——这是 Solana 公链的特性，链上就锁定约 <b>0.002 SOL</b> 的租金。归零的 meme 币、垃圾币、貔貅币、空投币卖不掉、账户也关不了，这笔钱就卡在链上拿不回。",
    hero_p2: "本系统会帮你：<b>扫描 → 烧掉垃圾币 → 关闭僵尸账户 → 租金自动退回你钱包</b>。每个账户仅收 <b>0.0002 SOL</b>（约租金 <b>10%</b>）手续费，仅需极少量 SOL 作链上手续费。",
    hero_p3: "🎁 打狗的人还有一笔隐形押金：<b>Pump.fun 交易量累加器</b>（约 0.0018 SOL/账户，有的还累积返现）。别的工具扫不到，本系统<b>扫得到、退 90%、只收 10% 手续费</b>。",
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
    protected_hint: "🛡️ 受保护代币永不销毁：SOL / USDT / USDC / PYUSD / USDS / EURC",
    multi_sign_hint: "⚠️ 共 {total} 个账户，将分成 {tx} 笔交易，请在钱包中连续确认 {tx} 次签名。",
    wallet_warn: "🔐 私钥永不离开你的钱包。每个账户收 0.0002 SOL（约租金 10%），钱包里面仅需预留极少量 SOL（留 0.001 SOL 左右）作链上手续费。⚠️ 赎回前请先把钱包里有价值的币转走或卖掉——系统会销毁所有有余额的代币账户（受保护代币 SOL/USDT/USDC/PYUSD/USDS/EURC 除外），避免误烧。⚠️ 账户较多时会分成多笔交易，需在钱包多次确认签名（每笔约 20 个账户）。",
    wallet_verify_tx: "🔍 请在钱包弹窗里核对每笔交易：是「关闭代币账户 / 退回租金」，不是转出你的 SOL / USDT 等资产。",
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
    stat_nonredeemable: "不可赎回",
    stat_nft: "疑似 NFT",
    stat_recoverable: "可回收账户",
    stat_recoverable_sol: "可回收 SOL",
    stat_volume: "Pump.fun 押金+返现",
    cat_empty: "可直接关",
    cat_burnable: "系统会自动销毁代币再执行租金赎回操作",
    cat_protected: "受保护",
    cat_nonredeemable: "不可赎回",
    cat_nft: "疑似 NFT（请核对价值）",
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
    wr_view_tx: "查看转账交易",
    no_accounts: "未发现代币账户",
    no_reclaimable: "没有可退回租金的账户（0 个可关账户）",
    nft_warn: "⚠️ 检测到 {n} 个疑似 NFT（不可分割的唯一资产）。系统默认不销毁，请先核对价值：确认是垃圾再勾选销毁，值钱的请转走。",
    nft_select_all: "全选",
    nft_select_none: "清空",
    wallet_balance: "钱包 SOL 余额",
    querying: "查询中…",
    processing: "处理中…",
    connected: "已连接",
    copy: "📋 复制",
    copy_done: "✅ 已复制",
    err_no_wallet: "未检测到 Solana 钱包。请安装 Phantom / Solflare / OKX / TokenPocket / Backpack 等。注意：MetaMask 是 ETH 钱包，不支持 Solana。",
    err_connect_fail: "连接失败",
    err_please_connect: "请先连接钱包",
    err_please_addr: "请输入地址",
    err_broadcast_fail: "广播失败: ",
    err_reclaim_fail: "退回失败",
    err_start_fail: "启动失败",
    err_task_fail: "任务失败",
    progress_step: "✅ 第 {i}/{n} 笔：关闭 {c} 个账户，净额 {net} SOL 已转回",
    share_title: "🚀 分享你的战果",
    share_text: "我在 solata.top 一键拿回了 {sol} SOL 死账户租金 💰 你钱包里估计也锁着不少，快查查 👉 {url}",
    share_copy: "📋 复制文案",
    share_tg: "💬 分享到 TG",
    share_x: "𝕏 分享到 X",
    invite_title: "🎁 邀请好友，一起拿回租金",
    invite_desc: "好友通过你的链接退租，你每账户得 0.0001 SOL 返佣",
    invite_copy: "📋 复制邀请链接",
    invite_copied: "✅ 已复制",
    guide_h2: "Solana 退租金教程：拿回你钱包里锁住的 SOL",
    guide_p1: "在 Solana 链上，<b>每交易一个新的代币，钱包会自动创建一个「代币账户」（ATA）</b>，每个账户锁定约 <b>0.00203928 SOL</b> 的租金押金。当你买入的 meme 币、土狗币、归零币、貔貅币跌到归零后，币卖不出去、账户也关不掉，这笔 SOL 租金就被永远卡在链上——除非你主动去关闭账户、退回租金。",
    guide_p2: "打开 <a href='/' style='color:var(--blue)'>solata.top</a> → 连接钱包（Phantom / Solflare / OKX 等）→ 系统自动扫描你所有代币账户 → <b>一键关闭僵尸账户、退回租金</b>。每个账户只收 0.0002 SOL（约租金 10%），<b>退成功才收费</b>。SOL / USDT / USDC / PYUSD / USDS / EURC 等受保护代币<b>永不销毁</b>；其余代币账户会被关闭退租，<b>赎回前请先转走有价值的币</b>。代码开源，私钥永不离开你的钱包。",
    guide_p3: "另外，打狗的人还有 <b>Pump.fun 交易量押金（累加器）</b>：在 pump.fun 上交易会自动创建累加器账户，锁约 0.0018 SOL，有的还累积返现。它挂在 pump.fun 程序名下、不是普通代币账户，多数工具扫不到。solata.top 能扫出来并<b>退回净额（押金+返现，扣 10% 手续费）</b>。",
    guide_faq_h3: "常见问题（FAQ）",
    guide_faq_q1: "每个账户能退回多少 SOL？",
    guide_faq_a1: "约 0.00203928 SOL，这是 Solana 链上每个代币账户（ATA）的标准租金。打过的归零币越多，能退回的租金越多。",
    guide_faq_q2: "怎么查我的钱包锁了多少租金？",
    guide_faq_a2: "两种方式：① 把钱包地址发给 TG 机器人 <a href='https://t.me/solata_rent_bot' target='_blank' rel='noopener' style='color:var(--blue)'>@solata_rent_bot</a>，秒回你锁了多少 SOL；② 直接打开 solata.top 连接钱包查看。",
    guide_faq_q3: "为什么有些账户显示「不可赎回」？",
    guide_faq_a3: "有些项目方给代币设置了 closeAuthority（关户权限），这种账户链上就关不掉。其余没有 closeAuthority 的账户都能退回租金。",
    guide_faq_q4: "我钱包里没有 SOL 了，还能退吗？",
    guide_faq_a4: "退回需要极少量 SOL 作为链上手续费（约 0.000005 SOL/签名）。如果余额为 0，先充一点点 SOL 即可。",
    guide_faq_q5: "会不会误烧掉我值钱的币？",
    guide_faq_a5: "受保护代币 SOL / USDT / USDC / PYUSD / USDS / EURC 永不销毁。其余有余额的代币账户会被销毁并退回租金，所以<b>赎回前请先自行转走钱包里有价值的币</b>，避免误烧。",
    guide_link_full: "📖 完整教程",
    guide_link_faq: "❓ 更多 FAQ",
    volume_title: "🪙 Pump.fun 交易量押金",
    volume_account: "累加器账户",
    volume_sol: "押金+返现总额",
    volume_fee: "手续费(10%)",
    volume_net: "到手净额",
    volume_redeem: "退回交易量押金",
    volume_none: "无累加器押金",
    volume_step: "✅ 已退回交易量押金净额 {sol} SOL（扣 10% 手续费）",
    guide_link_rent: "💡 什么是租金",
    tab_batch: "🔒 批量钱包退回",
    batch_keys_label: "私钥列表（一行一个）",
    batch_keys_ph: "每行粘贴一个钱包私钥（base58 或 JSON 数组）",
    batch_recipient_label: "收款账户地址（退回的 SOL 汇入这里）",
    batch_recipient_ph: "输入收款 Solana 地址",
    batch_scan_btn: "① 先查询能退多少",
    batch_redeem_btn: "② 确认退回",
    batch_disclaimer: "⚠️ 风险告知：提交私钥 = 永久放弃这些钱包，之后不可再使用或存钱。请先自行转走钱包内有价值的币/NFT。退回的租金/押金将汇入收款账户，扣 10% 手续费。我已阅读并同意，确认放弃这些钱包。",
    batch_stat_wallets: "钱包数",
    batch_stat_gross: "可退总额",
    batch_stat_fee: "手续费(10%)",
    batch_stat_net: "到手净额",
    batch_th_wallet: "钱包",
    batch_th_token: "代币账户",
    batch_th_acc: "累加器",
    batch_th_rent: "代币租金",
    batch_th_deposit: "累加器押金",
    batch_th_target: "退回账户",
    batch_th_tx: "转账",
    batch_confirm_hint: "⚠️ 请核对：查询结果与实际一致后再点「确认退回」。提交私钥即视为放弃这些钱包。",
    batch_partial_fail: "⚠️ {n} 个钱包退回失败，请查看下方错误信息",
    err_please_keys: "请粘贴私钥列表",
    err_please_recipient: "请输入收款账户地址",
    err_please_agree: "请先勾选同意风险告知",
  },
  en: {
    title: "🖊️ Reclaim Solana Rent - Get Back Your Locked SOL",
    hero_tagline: "Zeroed coins, junk coins, honeypot coins, airdrop coins in your wallet — they're locking up YOUR SOL 💰",
    hero_p1: "Every time you trade a different token, your Solana wallet auto-opens a token account — that's how the Solana blockchain works. Each account locks ~<b>0.002 SOL</b> in rent. When zeroed meme coins, junk coins, honeypot coins, and airdrop coins can't be sold and the account can't be closed, that SOL is stuck on-chain.",
    hero_p2: "This system helps you: <b>scan → burn junk coins → close zombie accounts → rent auto-returned to your wallet</b>. Each account costs only <b>0.0002 SOL</b> (~<b>10%</b> of rent); you only need a tiny amount of SOL for the on-chain fee.",
    hero_p3: "🎁 Pump.fun traders have one more hidden deposit: the <b>Pump.fun volume accumulator</b> (~0.0018 SOL/account, sometimes with accumulated cashback). Other tools can't see it — we <b>scan it and reclaim it, charging only a 10% fee</b>.",
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
    protected_hint: "🛡️ Protected tokens are never burned: SOL / USDT / USDC / PYUSD / USDS / EURC",
    multi_sign_hint: "⚠️ {total} accounts will be split into {tx} transactions — please approve {tx} signatures in your wallet.",
    wallet_warn: "🔐 Your private key never leaves your wallet. Each account costs 0.0002 SOL (~10% of rent). Just keep a tiny reserve of SOL (~0.001 SOL) for the on-chain fee. ⚠️ Before reclaiming, transfer out or sell any valuable tokens first — the system burns every token account that has a balance (except protected tokens SOL/USDT/USDC/PYUSD/USDS/EURC). ⚠️ With many accounts, the reclaim is split into multiple transactions and needs multiple wallet signatures (~20 accounts per tx).",
    wallet_verify_tx: "🔍 Please verify each transaction in your wallet: it should be 'closing token accounts / reclaiming rent', NOT sending out your SOL / USDT assets.",
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
    stat_nonredeemable: "Non-redeemable",
    stat_nft: "Possible NFTs",
    stat_recoverable: "Reclaimable Accounts",
    stat_recoverable_sol: "Reclaimable SOL",
    stat_volume: "Pump.fun Deposit",
    cat_empty: "Can close directly",
    cat_burnable: "System will auto-burn tokens then reclaim rent",
    cat_protected: "Protected",
    cat_nonredeemable: "Non-redeemable",
    cat_nft: "Possible NFT (verify value)",
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
    wr_view_tx: "View transfer tx",
    no_accounts: "No token accounts found",
    no_reclaimable: "No reclaimable accounts (0 closable accounts)",
    nft_warn: "⚠️ Detected {n} possible NFTs (indivisible unique assets). They are NOT burned by default — verify their value first: check to burn only the junk, transfer out anything valuable.",
    nft_select_all: "Select all",
    nft_select_none: "Clear",
    wallet_balance: "Wallet SOL Balance",
    querying: "Looking up…",
    processing: "Processing…",
    connected: "Connected",
    copy: "📋 Copy",
    copy_done: "✅ Copied",
    err_no_wallet: "No Solana wallet detected. Please install Phantom / Solflare / OKX / TokenPocket / Backpack, etc. Note: MetaMask is an ETH wallet and does not support Solana.",
    err_connect_fail: "Connection failed",
    err_please_connect: "Please connect your wallet first",
    err_please_addr: "Please enter an address",
    err_broadcast_fail: "Broadcast failed: ",
    err_reclaim_fail: "Reclaim failed",
    err_start_fail: "Failed to start",
    err_task_fail: "Task failed",
    progress_step: "✅ Step {i}/{n}: closed {c} accounts, {net} SOL returned",
    share_title: "🚀 Share your win",
    share_text: "I just reclaimed {sol} SOL in dead-account rent on solata.top 💰 You probably have some locked too — check yours 👉 {url}",
    share_copy: "📋 Copy text",
    share_tg: "💬 Share to TG",
    share_x: "𝕏 Share to X",
    invite_title: "🎁 Invite friends, reclaim rent together",
    invite_desc: "You earn 0.0001 SOL for every account your friend reclaims via your link",
    invite_copy: "📋 Copy invite link",
    invite_copied: "✅ Copied",
    guide_h2: "Solana Rent Reclaim Tutorial: Get Back the SOL Locked in Your Wallet",
    guide_p1: "On Solana, <b>every new token you trade auto-creates a token account (ATA) in your wallet</b>, and each account locks about <b>0.00203928 SOL</b> as a rent deposit. When the meme coins, shitcoins, dead coins, or honeypot coins you bought drop to zero, they can't be sold and the account can't be closed — that SOL rent stays stuck on-chain unless you actively close the account and reclaim the rent.",
    guide_p2: "Open <a href='/' style='color:var(--blue)'>solata.top</a> → connect your wallet (Phantom / Solflare / OKX, etc.) → the system auto-scans all your token accounts → <b>close zombie accounts and reclaim rent in one click</b>. Each account costs only 0.0002 SOL (~10% of rent), <b>charged only on success</b>. Protected tokens like SOL / USDT / USDC / PYUSD / USDS / EURC are <b>never burned</b>; other token accounts are closed to reclaim rent — <b>transfer out valuable tokens first</b>. Open source, your private key never leaves your wallet.",
    guide_p3: "Also, pump.fun traders have a <b>Pump.fun volume deposit (accumulator)</b>: trading on pump.fun auto-creates an accumulator account locking ~0.0018 SOL, sometimes with accumulated cashback. It lives under the pump.fun program — not a regular token account — so most tools miss it. solata.top scans and <b>reclaims it (deposit + cashback, 10% fee)</b>.",
    guide_faq_h3: "FAQ (Frequently Asked Questions)",
    guide_faq_q1: "How much SOL can I reclaim per account?",
    guide_faq_a1: "About 0.00203928 SOL — the standard rent for each token account (ATA) on Solana. The more dead coins you've traded, the more rent you can reclaim.",
    guide_faq_q2: "How do I check how much rent is locked in my wallet?",
    guide_faq_a2: "Two ways: ① send your wallet address to the TG bot <a href='https://t.me/solata_rent_bot' target='_blank' rel='noopener' style='color:var(--blue)'>@solata_rent_bot</a> for an instant result; ② open solata.top and connect your wallet.",
    guide_faq_q3: "Why do some accounts show 'non-redeemable'?",
    guide_faq_a3: "Some projects set a closeAuthority (close permission) on their token, making the account impossible to close on-chain. All other accounts without a closeAuthority can be reclaimed.",
    guide_faq_q4: "What if my wallet has no SOL left?",
    guide_faq_a4: "Reclaiming needs a tiny amount of SOL for the on-chain fee (~0.000005 SOL per signature). Top up a little SOL first if your balance is zero.",
    guide_faq_q5: "Will it accidentally burn my valuable tokens?",
    guide_faq_a5: "Protected tokens SOL / USDT / USDC / PYUSD / USDS / EURC are never burned. Other token accounts with a balance will be burned and the rent reclaimed, so <b>transfer out any valuable tokens first</b> to avoid accidental burns.",
    guide_link_full: "📖 Full Tutorial",
    guide_link_faq: "❓ More FAQ",
    volume_title: "🪙 Pump.fun Volume Deposit",
    volume_account: "Accumulator Account",
    volume_sol: "Deposit + Cashback",
    volume_fee: "Fee (10%)",
    volume_net: "Net Received",
    volume_redeem: "Reclaim Volume Deposit",
    volume_none: "No volume deposit",
    volume_step: "✅ Reclaimed volume deposit net {sol} SOL (10% fee)",
    guide_link_rent: "💡 What is Rent",
    tab_batch: "🔒 Batch Reclaim",
    batch_keys_label: "Private key list (one per line)",
    batch_keys_ph: "Paste one wallet private key per line (base58 or JSON array)",
    batch_recipient_label: "Recipient address (reclaimed SOL goes here)",
    batch_recipient_ph: "Enter recipient Solana address",
    batch_scan_btn: "① Check how much",
    batch_redeem_btn: "② Confirm Reclaim",
    batch_disclaimer: "⚠️ Risk notice: submitting a private key = permanently abandoning these wallets; they can no longer be used or funded. Transfer out any valuable tokens/NFTs first. Reclaimed rent/deposits go to the recipient address, minus a 10% fee. I have read and agree, and confirm abandoning these wallets.",
    batch_stat_wallets: "Wallets",
    batch_stat_gross: "Total Reclaimable",
    batch_stat_fee: "Fee (10%)",
    batch_stat_net: "Net Received",
    batch_th_wallet: "Wallet",
    batch_th_token: "Token Accts",
    batch_th_acc: "Accumulators",
    batch_th_rent: "Token Rent",
    batch_th_deposit: "Accum. Deposit",
    batch_th_target: "Accounts Reclaimed",
    batch_th_tx: "Tx",
    batch_confirm_hint: "⚠️ Double-check the estimate matches before clicking Confirm. Submitting private keys means abandoning these wallets.",
    batch_partial_fail: "⚠️ {n} wallets failed — see errors below",
    err_please_keys: "Please paste private keys",
    err_please_recipient: "Please enter a recipient address",
    err_please_agree: "Please agree to the risk notice first",
  },
  tr: {
    title: "🖊️ Solana Kira Geri Alma - Cüzdanında Kilitli SOL'unu Geri Al",
    hero_tagline: "Cüzdanındaki sıfırlanmış, çöp, honeypot ve airdrop coin'ler SENİN SOL'unu kilitliyor 💰",
    hero_p1: "Farklı bir token ile her işlem yaptığında, Solana cüzdanın otomatik olarak bir token hesabı açar — Solana zincirinin özelliği budur; her hesap yaklaşık <b>0.002 SOL</b> kirayı kilitler. Sıfırlanmış meme, çöp, honeypot ve airdrop coin'ler satılamaz, hesap da kapatılamaz; bu SOL zincirde sıkışıp kalır.",
    hero_p2: "Bu sistem sana yardımcı olur: <b>tara → çöp coin'leri yak → zombi hesapları kapat → kira otomatik olarak cüzdanına geri döner</b>. Her hesap yalnızca <b>0.0002 SOL</b> (kiranın yaklaşık <b>%10</b>'u) komisyon alır; zincir üstü işlem ücreti için çok az SOL gerekir.",
    hero_p3: "🎁 Pump.fun'da işlem yapanların bir gizli depozitosu daha var: <b>Pump.fun işlem hacmi akümülatörü</b> (hesap başına ~0.0018 SOL, bazılarında birikmiş cashback de olur). Diğer araçlar göremez — bu sistem <b>görür, %90'ını geri verir, yalnızca %10 komisyon alır</b>.",
    hero_cta: "👇 Cüzdanını bağla, ne kadar SOL'un kilitli olduğunu gör",
    hero_note: "Kod <a href=\"https://github.com/SOLANAN-ATA/sol-ata-rent-recovery\" target=\"_blank\" rel=\"noopener\">GitHub'da açık kaynak</a> — dilediğin gibi incele. Gizli bir şey yok.",
    tab_wallet: "🔗 Bağla ve Geri Al",
    tab_scan: "🔍 Adres Sorgula",
    wallet_label: "Solana cüzdanını bağla (Phantom / Solflare / OKX / TokenPocket / Backpack vb.)",
    connect_btn: "Cüzdanı Bağla",
    disconnect_btn: "Bağlantıyı Kes",
    connected_prefix: "Bağlı: ",
    not_connected: "Bağlı değil",
    redeem_btn: "Tara ve Tek Tıkla Geri Al",
    protected_hint: "🛡️ Korumalı token'lar asla yakılmaz: SOL / USDT / USDC / PYUSD / USDS / EURC",
    multi_sign_hint: "⚠️ Toplam {total} hesap, {tx} işleme bölünecek; cüzdanda {tx} kez imza onaylaman gerekecek.",
    wallet_warn: "🔐 Özel anahtarın cüzdanından asla çıkmaz. Her hesap 0.0002 SOL (kiranın yaklaşık %10'u) komisyon alır; cüzdanda zincir üstü ücret için çok az SOL (yaklaşık 0.001 SOL) bırakman yeterli. ⚠️ Geri almadan önce cüzdanındaki değerli coin'leri taşı veya sat — sistem bakiyesi olan tüm token hesaplarını yakar (korumalı token'lar SOL/USDT/USDC/PYUSD/USDS/EURC hariç), yanlışlıkla yakmayı önlemek için. ⚠️ Hesap çoksa birden fazla işleme bölünür ve cüzdanda birkaç kez imza onaylaman gerekir (her işlem yaklaşık 20 hesap).",
    wallet_verify_tx: "🔍 Cüzdan penceresinde her işlemi kontrol et: 'token hesabını kapat / kirayı geri al' olmalı, SOL / USDT gibi varlıklarını transfer etmemeli.",
    scan_label: "Cüzdan adresi (public key)",
    scan_placeholder: "Herhangi bir Solana adresi gir, geri alınabilir depozitolu sıfırlanmış coin'leri sorgula",
    scan_btn: "Sorgula",
    footer_title: "Bize Ulaş / Topluluk",
    footer_tg: "💬 TG Grubu",
    footer_debox: "📱 DEBOX Grubu",
    footer_x: "𝕏 X.com",
    footer_web: "🌐 Resmi Site",
    stat_total: "Token Hesabı Toplamı",
    stat_empty: "Doğrudan Kapatılabilir",
    stat_burnable: "Sistem yakıp geri verir",
    stat_protected: "Korumalı",
    stat_nonredeemable: "Geri Alınamaz",
    stat_nft: "Şüpheli NFT",
    stat_recoverable: "Geri Alınabilir Hesap",
    stat_recoverable_sol: "Geri Alınabilir SOL",
    stat_volume: "Pump.fun Depozito+Cashback",
    cat_empty: "Doğrudan Kapatılabilir",
    cat_burnable: "Sistem token'ı yakıp kira geri alma işlemini yürütür",
    cat_protected: "Korumalı",
    cat_nonredeemable: "Geri Alınamaz",
    cat_nft: "Şüpheli NFT (değerini kontrol et)",
    th_mint: "Token Mint",
    th_program: "Program",
    th_balance: "Bakiye",
    th_category: "Kategori",
    th_recoverable: "Geri Alınabilir (SOL)",
    wr_accounts: "Geri Alınan Hesap",
    wr_rent: "Geri Alınan Kira SOL",
    wr_fee: "Platform Komisyonu SOL",
    wr_broadcast: "İşlem yayınlandı",
    wr_signatures: "İşlem imzaları: ",
    wr_net: "Net Geri Dönüş SOL",
    wr_forward: "✅ Platform net tutarı cüzdanına geri gönderdi",
    wr_view_tx: "Transfer işlemini görüntüle",
    no_accounts: "Token hesabı bulunamadı",
    no_reclaimable: "Geri alınabilecek kira hesabı yok (0 kapatılabilir hesap)",
    nft_warn: "⚠️ {n} şüpheli NFT (bölünemez benzersiz varlık) tespit edildi. Sistem varsayılan olarak yakmaz; önce değerini kontrol et: çöp olduğundan eminsen yakmak için işaretle, değerliyse taşı.",
    nft_select_all: "Tümünü Seç",
    nft_select_none: "Temizle",
    wallet_balance: "Cüzdan SOL Bakiyesi",
    querying: "Sorgulanıyor…",
    processing: "İşleniyor…",
    connected: "Bağlı",
    copy: "📋 Kopyala",
    copy_done: "✅ Kopyalandı",
    err_no_wallet: "Solana cüzdanı algılanmadı. Phantom / Solflare / OKX / TokenPocket / Backpack vb. kur. Not: MetaMask bir ETH cüzdanıdır, Solana'yı desteklemez.",
    err_connect_fail: "Bağlantı başarısız",
    err_please_connect: "Lütfen önce cüzdanı bağla",
    err_please_addr: "Lütfen bir adres gir",
    err_broadcast_fail: "Yayınlama başarısız: ",
    err_reclaim_fail: "Geri alma başarısız",
    err_start_fail: "Başlatma başarısız",
    err_task_fail: "Görev başarısız",
    progress_step: "✅ {i}/{n} işlem: {c} hesap kapatıldı, net {net} SOL geri gönderildi",
    share_title: "🚀 Sonucunu Paylaş",
    share_text: "solata.top üzerinden {sol} SOL ölü hesap kirasını tek tıkla geri aldım 💰 Senin cüzdanında da çokça kilitli olabilir, hemen kontrol et 👉 {url}",
    share_copy: "📋 Metni Kopyala",
    share_tg: "💬 TG'de Paylaş",
    share_x: "𝕏 X'te Paylaş",
    invite_title: "🎁 Arkadaşını davet et, kirayı birlikte geri alın",
    invite_desc: "Arkadaşın senin bağlantınla kira geri alırsa, hesap başına 0.0001 SOL komisyon kazanırsın",
    invite_copy: "📋 Davet bağlantısını kopyala",
    invite_copied: "✅ Kopyalandı",
    guide_h2: "Solana Kira Geri Alma Rehberi: Cüzdanında Kilitli SOL'unu Geri Al",
    guide_p1: "Solana zincirinde, <b>yeni bir token ile her işlem yaptığında cüzdanın otomatik olarak bir 'token hesabı' (ATA) açar</b>; her hesap yaklaşık <b>0.00203928 SOL</b> kira depozitosu kilitler. Satın aldığın meme, köpek, sıfırlanmış ve honeypot coin'ler sıfıra düştüğünde satılamaz ve hesap kapatılamaz; bu SOL kirası — sen hesabı kapatıp kirayı geri almadıkça — zincirde kalıcı olarak kilitli kalır.",
    guide_p2: "<a href='/' style='color:var(--blue)'>solata.top</a> aç → cüzdanını bağla (Phantom / Solflare / OKX vb.) → sistem tüm token hesaplarını otomatik tarar → <b>tek tıkla zombi hesapları kapat, kirayı geri al</b>. Her hesap yalnızca 0.0002 SOL (kiranın yaklaşık %10'u) alır, <b>yalnızca başarılı geri almada ücret alınır</b>. SOL / USDT / USDC / PYUSD / USDS / EURC gibi korumalı token'lar <b>asla yakılmaz</b>; diğer token hesapları kapatılıp kira geri alınır, <b>geri almadan önce değerli coin'lerini taşı</b>. Kod açık kaynak, özel anahtarın cüzdanından asla çıkmaz.",
    guide_p3: "Ayrıca, Pump.fun'da işlem yapanların bir <b>Pump.fun işlem hacmi depozitosu (akümülatör)</b> var: pump.fun'da işlem yapmak otomatik olarak bir akümülatör hesabı oluşturur, yaklaşık 0.0018 SOL kilitler, bazılarında cashback birikir. Bu hesap pump.fun programına bağlıdır, normal bir token hesabı değildir ve çoğu araç göremez. solata.top bulur ve <b>net tutarı (depozito+cashback, %10 komisyon düşülerek) geri verir</b>.",
    guide_faq_h3: "Sık Sorulan Sorular (SSS)",
    guide_faq_q1: "Her hesaptan ne kadar SOL geri alabilirim?",
    guide_faq_a1: "Yaklaşık 0.00203928 SOL; bu, Solana zincirindeki her token hesabının (ATA) standart kirasıdır. Ne kadar çok sıfırlanmış coin'e girdiysen, o kadar çok kira geri alabilirsin.",
    guide_faq_q2: "Cüzdanımda ne kadar kira kilitli olduğunu nasıl kontrol ederim?",
    guide_faq_a2: "İki yol: ① Cüzdan adresini TG botuna <a href='https://t.me/solata_rent_bot' target='_blank' rel='noopener' style='color:var(--blue)'>@solata_rent_bot</a> gönder, saniyeler içinde ne kadar SOL kilitli olduğunu söyler; ② doğrudan solata.top açıp cüzdanını bağla.",
    guide_faq_q3: "Neden bazı hesaplar 'Geri Alınamaz' görünüyor?",
    guide_faq_a3: "Bazı proje ekipleri token'a closeAuthority (kapatma yetkisi) atar; bu tür hesaplar zincir üzerinde kapatılamaz. closeAuthority olmayan diğer tüm hesapların kirası geri alınabilir.",
    guide_faq_q4: "Cüzdanımda SOL kalmadı, yine de geri alabilir miyim?",
    guide_faq_a4: "Geri alma işlemi zincir üstü ücret olarak çok az SOL gerektirir (imza başına yaklaşık 0.000005 SOL). Bakiye 0 ise önce çok az SOL yüklemen yeterli.",
    guide_faq_q5: "Değerli coin'lerim yanlışlıkla yakar mı?",
    guide_faq_a5: "Korumalı token'lar SOL / USDT / USDC / PYUSD / USDS / EURC asla yakılmaz. Bakiyesi olan diğer token hesapları yakılıp kira geri alınır; bu yüzden <b>geri almadan önce cüzdanındaki değerli coin'leri kendin taşı</b>, yanlışlıkla yakmayı önlemek için.",
    guide_link_full: "📖 Tam Rehber",
    guide_link_faq: "❓ Daha Fazla SSS",
    volume_title: "🪙 Pump.fun İşlem Hacmi Depozitosu",
    volume_account: "Akümülatör Hesabı",
    volume_sol: "Depozito+Cashback Toplamı",
    volume_fee: "Komisyon (%10)",
    volume_net: "Net Alınacak",
    volume_redeem: "İşlem Hacmi Depozitosunu Geri Al",
    volume_none: "Akümülatör depozitosu yok",
    volume_step: "✅ İşlem hacmi depozitosunun net {sol} SOL'u geri alındı (%10 komisyon düşüldü)",
    guide_link_rent: "💡 Kira nedir",
    tab_batch: "🔒 Toplu Cüzdan Geri Alma",
    batch_keys_label: "Özel anahtar listesi (satır başına bir)",
    batch_keys_ph: "Her satıra bir cüzdan özel anahtarı yapıştır (base58 veya JSON dizi)",
    batch_recipient_label: "Alıcı hesap adresi (geri alınan SOL buraya gelir)",
    batch_recipient_ph: "Alıcı Solana adresini gir",
    batch_scan_btn: "① Önce ne kadar geri alınabileceğini sorgula",
    batch_redeem_btn: "② Geri Almayı Onayla",
    batch_disclaimer: "⚠️ Risk bildirimi: Özel anahtar göndermek = bu cüzdanları kalıcı olarak terk etmek demektir; bir daha kullanılamaz veya para yatırılamaz. Lütfen önce cüzdanındaki değerli coin/NFT'leri taşı. Geri alınan kira/depozito alıcı hesaba gönderilir, %10 komisyon düşülür. Okudum ve kabul ediyorum, bu cüzdanları terk etmeyi onaylıyorum.",
    batch_stat_wallets: "Cüzdan Sayısı",
    batch_stat_gross: "Geri Alınabilir Toplam",
    batch_stat_fee: "Komisyon (%10)",
    batch_stat_net: "Net Alınacak",
    batch_th_wallet: "Cüzdan",
    batch_th_token: "Token Hesabı",
    batch_th_acc: "Akümülatör",
    batch_th_rent: "Token Kirası",
    batch_th_deposit: "Aküm. Depozito",
    batch_th_target: "Geri Alınan Hesap",
    batch_th_tx: "Tx",
    batch_confirm_hint: "⚠️ Kontrol et: sorgu sonucu gerçekle eşleşmeden 'Geri Almayı Onayla'ya tıklama. Özel anahtar göndermek bu cüzdanları terk etmek demektir.",
    batch_partial_fail: "⚠️ {n} cüzdan geri alınamadı, aşağıdaki hatalara bak",
    err_please_keys: "Lütfen özel anahtar listesini yapıştır",
    err_please_recipient: "Lütfen alıcı hesap adresini gir",
    err_please_agree: "Lütfen önce risk bildirimini kabul et",
  },
  ko: {
    title: "🖊️ Solana 렌트 환급 - 지갑에 잠긴 SOL 되찾기",
    hero_tagline: "지갑 속 제로화·쓰레기·허니팟·에어드랍 코인이 당신의 SOL을 잠가두고 있습니다 💰",
    hero_p1: "서로 다른 토큰을 거래할 때마다 Solana 지갑은 자동으로 토큰 계정을 엽니다 — 이것이 Solana 체인의 특성이며, 각 계정은 약 <b>0.002 SOL</b>의 렌트를 잠급니다. 제로화된 밈·쓰레기·허니팟·에어드랍 코인은 팔리지도 않고 계정도 닫히지 않아 그 SOL이 체인에 묶입니다.",
    hero_p2: "이 시스템이 도와드립니다: <b>스캔 → 쓰레기 코인 소각 → 좀비 계정 폐쇄 → 렌트가 지갑으로 자동 환급</b>. 계정당 <b>0.0002 SOL</b>(렌트의 약 <b>10%</b>)만 수수료로 받으며, 체인 수수료용 소량의 SOL만 있으면 됩니다.",
    hero_p3: "🎁 Pump.fun 트레이더에게는 숨은 보증금이 하나 더 있습니다: <b>Pump.fun 거래량 누적기</b>(계정당 약 0.0018 SOL, 캐시백이 쌓인 경우도 있음). 다른 도구는 못 찾지만 이 시스템은 <b>찾아서 90%를 돌려주고 10% 수수료만 받습니다</b>.",
    hero_cta: "👇 지갑을 연결해 얼마나 많은 SOL이 잠겨 있는지 확인하세요",
    hero_note: "코드는 <a href=\"https://github.com/SOLANAN-ATA/sol-ata-rent-recovery\" target=\"_blank\" rel=\"noopener\">GitHub에 오픈소스</a>로 공개되어 있습니다 — 자유롭게 검토하세요. 숨기는 것 없습니다.",
    tab_wallet: "🔗 연결 및 환급",
    tab_scan: "🔍 주소 조회",
    wallet_label: "Solana 지갑 연결 (Phantom / Solflare / OKX / TokenPocket / Backpack 등)",
    connect_btn: "지갑 연결",
    disconnect_btn: "연결 해제",
    connected_prefix: "연결됨: ",
    not_connected: "미연결",
    redeem_btn: "스캔 후 원클릭 환급",
    protected_hint: "🛡️ 보호 토큰은 절대 소각되지 않습니다: SOL / USDT / USDC / PYUSD / USDS / EURC",
    multi_sign_hint: "⚠️ 총 {total}개 계정이 {tx}건의 거래로 나뉘며, 지갑에서 {tx}번 서명을 확인해야 합니다.",
    wallet_warn: "🔐 개인키는 지갑을 절대 떠나지 않습니다. 계정당 0.0002 SOL(렌트의 약 10%)을 받으며, 지갑에 체인 수수료용 소량의 SOL(약 0.001 SOL)만 남겨두면 됩니다. ⚠️ 환급 전에 지갑의 가치 있는 코인을 먼저 옮기거나 팔아주세요 — 시스템은 잔액이 있는 모든 토큰 계정을 소각합니다(보호 토큰 SOL/USDT/USDC/PYUSD/USDS/EURC 제외). ⚠️ 계정이 많으면 여러 건으로 나뉘어 지갑에서 여러 번 서명해야 합니다(건당 약 20개 계정).",
    wallet_verify_tx: "🔍 지갑 팝업에서 각 거래를 확인하세요: '토큰 계정 폐쇄 / 렌트 환급'이어야 하며, SOL / USDT 같은 자산을 보내는 것이 아닙니다.",
    scan_label: "지갑 주소 (공개키)",
    scan_placeholder: "임의의 Solana 주소를 입력해 환급 가능한 제로화 코인을 조회",
    scan_btn: "조회",
    footer_title: "문의 / 커뮤니티",
    footer_tg: "💬 TG 그룹",
    footer_debox: "📱 DEBOX 그룹",
    footer_x: "𝕏 X.com",
    footer_web: "🌐 공식 웹사이트",
    stat_total: "토큰 계정 총수",
    stat_empty: "바로 폐쇄 가능",
    stat_burnable: "시스템이 소각 후 환급",
    stat_protected: "보호됨",
    stat_nonredeemable: "환급 불가",
    stat_nft: "의심 NFT",
    stat_recoverable: "환급 가능 계정",
    stat_recoverable_sol: "환급 가능 SOL",
    stat_volume: "Pump.fun 보증금+캐시백",
    cat_empty: "바로 폐쇄 가능",
    cat_burnable: "시스템이 토큰을 소각한 뒤 렌트 환급 절차를 진행",
    cat_protected: "보호됨",
    cat_nonredeemable: "환급 불가",
    cat_nft: "의심 NFT (가치 확인 필요)",
    th_mint: "토큰 Mint",
    th_program: "프로그램",
    th_balance: "잔액",
    th_category: "분류",
    th_recoverable: "환급 가능 (SOL)",
    wr_accounts: "환급 계정",
    wr_rent: "환급 렌트 SOL",
    wr_fee: "플랫폼 수수료 SOL",
    wr_broadcast: "거래 전송됨",
    wr_signatures: "거래 서명: ",
    wr_net: "순 환급 SOL",
    wr_forward: "✅ 플랫폼이 순액을 지갑으로 돌려보냈습니다",
    wr_view_tx: "송금 거래 보기",
    no_accounts: "토큰 계정을 찾지 못했습니다",
    no_reclaimable: "환급 가능한 렌트 계정이 없습니다 (폐쇄 가능 0개)",
    nft_warn: "⚠️ 의심 NFT(분할 불가능한 고유 자산) {n}개 감지. 시스템은 기본적으로 소각하지 않습니다. 먼저 가치를 확인하세요: 쓰레기임이 확실하면 소각 체크, 가치가 있으면 옮기세요.",
    nft_select_all: "전체 선택",
    nft_select_none: "해제",
    wallet_balance: "지갑 SOL 잔액",
    querying: "조회 중…",
    processing: "처리 중…",
    connected: "연결됨",
    copy: "📋 복사",
    copy_done: "✅ 복사됨",
    err_no_wallet: "Solana 지갑을 찾지 못했습니다. Phantom / Solflare / OKX / TokenPocket / Backpack 등을 설치하세요. 참고: MetaMask는 ETH 지갑이라 Solana를 지원하지 않습니다.",
    err_connect_fail: "연결 실패",
    err_please_connect: "먼저 지갑을 연결하세요",
    err_please_addr: "주소를 입력하세요",
    err_broadcast_fail: "전송 실패: ",
    err_reclaim_fail: "환급 실패",
    err_start_fail: "시작 실패",
    err_task_fail: "작업 실패",
    progress_step: "✅ {i}/{n}건: {c}개 계정 폐쇄, 순 {net} SOL 환급 완료",
    share_title: "🚀 결과 공유하기",
    share_text: "solata.top에서 죽은 계정 렌트 {sol} SOL을 원클릭으로 되찾았습니다 💰 당신 지갑에도 많이 잠겨 있을 수 있어요, 바로 확인 👉 {url}",
    share_copy: "📋 문구 복사",
    share_tg: "💬 TG에 공유",
    share_x: "𝕏 X에 공유",
    invite_title: "🎁 친구 초대하고 함께 렌트 되찾기",
    invite_desc: "친구가 당신의 링크로 렌트를 환급하면 계정당 0.0001 SOL 리베이트",
    invite_copy: "📋 초대 링크 복사",
    invite_copied: "✅ 복사됨",
    guide_h2: "Solana 렌트 환급 튜토리얼: 지갑에 잠긴 SOL 되찾기",
    guide_p1: "Solana 체인에서 <b>새 토큰을 거래할 때마다 지갑이 자동으로 '토큰 계정'(ATA)을 생성</b>하며, 각 계정은 약 <b>0.00203928 SOL</b>의 렌트 보증금을 잠급니다. 매수한 밈·잡·제로화·허니팟 코인이 제로가 되면 팔리지도 않고 계정도 닫히지 않아, 이 SOL 렌트는 — 계정을 닫고 렌트를 환급하기 전까지 — 체인에 영구히 잠깁니다.",
    guide_p2: "<a href='/' style='color:var(--blue)'>solata.top</a> 열기 → 지갑 연결(Phantom / Solflare / OKX 등) → 시스템이 모든 토큰 계정을 자동 스캔 → <b>원클릭으로 좀비 계정 폐쇄, 렌트 환급</b>. 계정당 0.0002 SOL(렌트의 약 10%)만 받으며, <b>환급 성공 시에만 수수료를 받습니다</b>. SOL / USDT / USDC / PYUSD / USDS / EURC 등 보호 토큰은 <b>절대 소각되지 않습니다</b>; 그 외 토큰 계정은 폐쇄·환급되므로 <b>환급 전에 가치 있는 코인을 옮기세요</b>. 코드는 오픈소스이며 개인키는 지갑을 떠나지 않습니다.",
    guide_p3: "또한 Pump.fun 트레이더에게는 <b>Pump.fun 거래량 보증금(누적기)</b>이 있습니다: pump.fun에서 거래하면 누적기 계정이 자동 생성되어 약 0.0018 SOL을 잠그고, 캐시백이 쌓이기도 합니다. 이 계정은 pump.fun 프로그램에 속해 일반 토큰 계정이 아니라 대부분의 도구가 못 찾습니다. solata.top은 찾아내 <b>순액(보증금+캐시백, 10% 수수료 차감)을 환급</b>합니다.",
    guide_faq_h3: "자주 묻는 질문 (FAQ)",
    guide_faq_q1: "계정당 얼마나 많은 SOL을 환급받을 수 있나요?",
    guide_faq_a1: "약 0.00203928 SOL로, Solana 체인에서 각 토큰 계정(ATA)의 표준 렌트입니다. 거래한 제로화 코인이 많을수록 환급받을 렌트가 많아집니다.",
    guide_faq_q2: "내 지갑에 렌트가 얼마나 잠겼는지 어떻게 확인하나요?",
    guide_faq_a2: "두 가지 방법: ① 지갑 주소를 TG 봇 <a href='https://t.me/solata_rent_bot' target='_blank' rel='noopener' style='color:var(--blue)'>@solata_rent_bot</a>에 보내면 몇 초 만에 잠긴 SOL을 알려줍니다; ② solata.top을 열어 지갑을 연결해 확인.",
    guide_faq_q3: "일부 계정이 '환급 불가'로 표시되는 이유는?",
    guide_faq_a3: "일부 프로젝트 팀이 토큰에 closeAuthority(폐쇄 권한)를 설정한 경우, 그 계정은 체인상에서 닫을 수 없습니다. closeAuthority가 없는 나머지 계정은 모두 렌트를 환급받을 수 있습니다.",
    guide_faq_q4: "지갑에 SOL이 없는데 환급받을 수 있나요?",
    guide_faq_a4: "환급에는 체인 수수료로 소량의 SOL(서명당 약 0.000005 SOL)이 필요합니다. 잔액이 0이면 SOL을 조금만 충전하면 됩니다.",
    guide_faq_q5: "가치 있는 코인을 실수로 소각하지 않을까요?",
    guide_faq_a5: "보호 토큰 SOL / USDT / USDC / PYUSD / USDS / EURC는 절대 소각되지 않습니다. 잔액이 있는 다른 토큰 계정은 소각 후 렌트가 환급되므로, <b>환급 전에 지갑의 가치 있는 코인을 직접 옮겨</b> 실수로 소각되는 것을 막으세요.",
    guide_link_full: "📖 전체 튜토리얼",
    guide_link_faq: "❓ 더 많은 FAQ",
    volume_title: "🪙 Pump.fun 거래량 보증금",
    volume_account: "누적기 계정",
    volume_sol: "보증금+캐시백 합계",
    volume_fee: "수수료 (10%)",
    volume_net: "실수령액",
    volume_redeem: "거래량 보증금 환급",
    volume_none: "누적기 보증금 없음",
    volume_step: "✅ 거래량 보증금 순액 {sol} SOL 환급 완료 (10% 수수료 차감)",
    guide_link_rent: "💡 렌트란?",
    tab_batch: "🔒 일괄 지갑 환급",
    batch_keys_label: "개인키 목록 (한 줄에 하나)",
    batch_keys_ph: "각 줄에 지갑 개인키를 붙여넣기 (base58 또는 JSON 배열)",
    batch_recipient_label: "수금 계정 주소 (환급된 SOL이 여기로 입금)",
    batch_recipient_ph: "수금 Solana 주소 입력",
    batch_scan_btn: "① 먼저 환급 가능 금액 조회",
    batch_redeem_btn: "② 환급 확인",
    batch_disclaimer: "⚠️ 위험 고지: 개인키 제출 = 이 지갑을 영구 포기하는 것이며, 이후 사용하거나 입금할 수 없습니다. 먼저 지갑의 가치 있는 코인/NFT를 옮기세요. 환급된 렌트/보증금은 수금 계정으로 입금되며 10% 수수료가 차감됩니다. 읽었으며 동의하고, 이 지갑을 포기함을 확인합니다.",
    batch_stat_wallets: "지갑 수",
    batch_stat_gross: "환급 가능 총액",
    batch_stat_fee: "수수료 (10%)",
    batch_stat_net: "실수령액",
    batch_th_wallet: "지갑",
    batch_th_token: "토큰 계정",
    batch_th_acc: "누적기",
    batch_th_rent: "토큰 렌트",
    batch_th_deposit: "누적기 보증금",
    batch_th_target: "환급 계정",
    batch_th_tx: "Tx",
    batch_confirm_hint: "⚠️ 확인: 조회 결과가 실제와 일치할 때만 '환급 확인'을 클릭하세요. 개인키 제출은 이 지갑을 포기하는 것입니다.",
    batch_partial_fail: "⚠️ {n}개 지갑 환급 실패, 아래 오류를 확인하세요",
    err_please_keys: "개인키 목록을 붙여넣으세요",
    err_please_recipient: "수금 계정 주소를 입력하세요",
    err_please_agree: "먼저 위험 고지에 동의하세요",
  },
  ja: {
    title: "🖊️ Solana レント返金 - ウォレットにロックされた SOL を取り戻す",
    hero_tagline: "ウォレット内のゼロ化・ゴミ・ハニーポット・エアドロップコインが、あなたの SOL をロックしています 💰",
    hero_p1: "異なるトークンを取引するたびに、Solana ウォレットは自動的にトークンアカウントを開設します — これが Solana チェーンの仕様で、各アカウントは約 <b>0.002 SOL</b> のレントをロックします。ゼロ化したミーム・ゴミ・ハニーポット・エアドロップコインは売れず、アカウントも閉じられないため、その SOL はチェーン上に固定されたままになります。",
    hero_p2: "このシステムが支援します: <b>スキャン → ゴミコインを焼却 → ゾンビアカウントを閉鎖 → レントがウォレットへ自動返金</b>。各アカウントは <b>0.0002 SOL</b>(レントの約 <b>10%</b>)の手数料のみで、チェーン上の手数料用にごく少量の SOL があれば十分です。",
    hero_p3: "🎁 Pump.fun トレーダーにはもう一つ隠れたデポジットがあります: <b>Pump.fun 取引量アキュムレータ</b>(アカウントあたり約 0.0018 SOL、キャッシュバックが溜まるものも)。他のツールは見つけられませんが、このシステムは <b>見つけて 90% を返金し、10% の手数料のみ</b>です。",
    hero_cta: "👇 ウォレットを接続して、どれだけの SOL がロックされているか確認",
    hero_note: "コードは <a href=\"https://github.com/SOLANAN-ATA/sol-ata-rent-recovery\" target=\"_blank\" rel=\"noopener\">GitHub でオープンソース</a>公開されています — 自由にご確認ください。隠し事はありません。",
    tab_wallet: "🔗 接続して返金",
    tab_scan: "🔍 アドレス照会",
    wallet_label: "Solana ウォレットを接続 (Phantom / Solflare / OKX / TokenPocket / Backpack など)",
    connect_btn: "ウォレット接続",
    disconnect_btn: "切断",
    connected_prefix: "接続済み: ",
    not_connected: "未接続",
    redeem_btn: "スキャンしてワンクリック返金",
    protected_hint: "🛡️ 保護トークンは絶対に焼却しません: SOL / USDT / USDC / PYUSD / USDS / EURC",
    multi_sign_hint: "⚠️ 合計 {total} 個のアカウントを {tx} 件のトランザクションに分割し、ウォレットで {tx} 回の署名確認が必要です。",
    wallet_warn: "🔐 秘密鍵はウォレットから一切出ません。各アカウント 0.0002 SOL(レントの約 10%)の手数料がかかり、ウォレットにはチェーン上の手数料用にごく少量の SOL(約 0.001 SOL)だけ残してください。⚠️ 返金前に、ウォレット内の価値あるコインを先に移動または売却してください — システムは残高のあるすべてのトークンアカウントを焼却します(保護トークン SOL/USDT/USDC/PYUSD/USDS/EURC を除く)。⚠️ アカウントが多い場合は複数トランザクションに分割され、ウォレットで複数回の署名が必要です(1 件あたり約 20 アカウント)。",
    wallet_verify_tx: "🔍 ウォレットのポップアップで各トランザクションを確認してください: 「トークンアカウントの閉鎖 / レント返金」であり、SOL / USDT などの資産を送るものではないことを確認。",
    scan_label: "ウォレットアドレス (公開鍵)",
    scan_placeholder: "任意の Solana アドレスを入力し、返金可能なゼロ化コインを照会",
    scan_btn: "照会",
    footer_title: "お問い合わせ / コミュニティ",
    footer_tg: "💬 TG グループ",
    footer_debox: "📱 DEBOX グループ",
    footer_x: "𝕏 X.com",
    footer_web: "🌐 公式サイト",
    stat_total: "トークンアカウント総数",
    stat_empty: "直接閉鎖可能",
    stat_burnable: "システムが焼却して返金",
    stat_protected: "保護",
    stat_nonredeemable: "返金不可",
    stat_nft: "NFT 疑い",
    stat_recoverable: "返金可能アカウント",
    stat_recoverable_sol: "返金可能 SOL",
    stat_volume: "Pump.fun デポジット+キャッシュバック",
    cat_empty: "直接閉鎖可能",
    cat_burnable: "システムがトークンを焼却してレント返金処理を実行",
    cat_protected: "保護",
    cat_nonredeemable: "返金不可",
    cat_nft: "NFT 疑い (価値を確認してください)",
    th_mint: "トークン Mint",
    th_program: "プログラム",
    th_balance: "残高",
    th_category: "分類",
    th_recoverable: "返金可能 (SOL)",
    wr_accounts: "返金アカウント",
    wr_rent: "返金レント SOL",
    wr_fee: "プラットフォーム手数料 SOL",
    wr_broadcast: "トランザクション送信済み",
    wr_signatures: "トランザクション署名: ",
    wr_net: "純返金 SOL",
    wr_forward: "✅ プラットフォームが純額をウォレットへ返金しました",
    wr_view_tx: "送金トランザクションを見る",
    no_accounts: "トークンアカウントが見つかりません",
    no_reclaimable: "返金可能なレントアカウントがありません (閉鎖可能 0 個)",
    nft_warn: "⚠️ NFT 疑い(分割不能な唯一の資産)を {n} 個検出。システムはデフォルトで焼却しません。まず価値を確認してください: ゴミと確信できれば焼却にチェック、価値があれば移動してください。",
    nft_select_all: "全選択",
    nft_select_none: "解除",
    wallet_balance: "ウォレット SOL 残高",
    querying: "照会中…",
    processing: "処理中…",
    connected: "接続済み",
    copy: "📋 コピー",
    copy_done: "✅ コピー済み",
    err_no_wallet: "Solana ウォレットが見つかりません。Phantom / Solflare / OKX / TokenPocket / Backpack などをインストールしてください。注意: MetaMask は ETH ウォレットで、Solana は非対応です。",
    err_connect_fail: "接続失敗",
    err_please_connect: "先にウォレットを接続してください",
    err_please_addr: "アドレスを入力してください",
    err_broadcast_fail: "送信失敗: ",
    err_reclaim_fail: "返金失敗",
    err_start_fail: "開始失敗",
    err_task_fail: "タスク失敗",
    progress_step: "✅ {i}/{n} 件目: {c} 個のアカウントを閉鎖、純 {net} SOL を返金済み",
    share_title: "🚀 結果をシェア",
    share_text: "solata.top で死んだアカウントのレント {sol} SOL をワンクリックで取り戻しました 💰 あなたのウォレットにも結構ロックされているかも、今すぐチェック 👉 {url}",
    share_copy: "📋 文面をコピー",
    share_tg: "💬 TG でシェア",
    share_x: "𝕏 X でシェア",
    invite_title: "🎁 友達を招待して一緒にレントを取り戻す",
    invite_desc: "友達があなたのリンクでレント返金すると、アカウントごとに 0.0001 SOL のリベート",
    invite_copy: "📋 招待リンクをコピー",
    invite_copied: "✅ コピー済み",
    guide_h2: "Solana レント返金チュートリアル: ウォレットにロックされた SOL を取り戻す",
    guide_p1: "Solana チェーンでは <b>新しいトークンを取引するたびに、ウォレットが自動的に「トークンアカウント」(ATA)を作成</b>し、各アカウントは約 <b>0.00203928 SOL</b> のレントデポジットをロックします。購入したミーム・草・ゼロ化・ハニーポットコインがゼロになると売れず、アカウントも閉じられないため、この SOL レントは — アカウントを閉鎖してレントを返金するまで — チェーン上に永久にロックされます。",
    guide_p2: "<a href='/' style='color:var(--blue)'>solata.top</a> を開く → ウォレットを接続(Phantom / Solflare / OKX など) → システムが全トークンアカウントを自動スキャン → <b>ワンクリックでゾンビアカウントを閉鎖し、レントを返金</b>。各アカウントは 0.0002 SOL(レントの約 10%)のみで、<b>返金成功時のみ課金</b>されます。SOL / USDT / USDC / PYUSD / USDS / EURC などの保護トークンは <b>絶対に焼却されません</b>; その他のトークンアカウントは閉鎖・返金されるため、<b>返金前に価値あるコインを移動してください</b>。コードはオープンソースで、秘密鍵はウォレットから出ません。",
    guide_p3: "また、Pump.fun トレーダーには <b>Pump.fun 取引量デポジット(アキュムレータ)</b>があります: pump.fun で取引するとアキュムレータアカウントが自動生成され、約 0.0018 SOL をロックし、キャッシュバックが溜まるものもあります。これは pump.fun プログラム配下で通常のトークンアカウントではないため、多くのツールは見つけられません。solata.top は見つけ出し、<b>純額(デポジット+キャッシュバック、10% 手数料差引)を返金</b>します。",
    guide_faq_h3: "よくある質問 (FAQ)",
    guide_faq_q1: "各アカウントからいくらの SOL を返金できますか?",
    guide_faq_a1: "約 0.00203928 SOL で、これは Solana チェーン上の各トークンアカウント(ATA)の標準レントです。取引したゼロ化コインが多いほど、返金できるレントが増えます。",
    guide_faq_q2: "ウォレットにどれだけレントがロックされているか確認するには?",
    guide_faq_a2: "2 つの方法: ① ウォレットアドレスを TG ボット <a href='https://t.me/solata_rent_bot' target='_blank' rel='noopener' style='color:var(--blue)'>@solata_rent_bot</a> に送ると、数秒でロックされている SOL を返答します; ② solata.top を開いてウォレットを接続して確認。",
    guide_faq_q3: "一部のアカウントが「返金不可」と表示されるのはなぜ?",
    guide_faq_a3: "一部のプロジェクトチームがトークンに closeAuthority(閉鎖権限)を設定している場合、そのアカウントはチェーン上で閉鎖できません。closeAuthority がないその他のアカウントはすべてレントを返金できます。",
    guide_faq_q4: "ウォレットに SOL がない場合でも返金できますか?",
    guide_faq_a4: "返金にはチェーン上の手数料としてごく少量の SOL(署名あたり約 0.000005 SOL)が必要です。残高が 0 なら、SOL を少しだけチャージすれば OK です。",
    guide_faq_q5: "価値あるコインを誤って焼却しませんか?",
    guide_faq_a5: "保護トークン SOL / USDT / USDC / PYUSD / USDS / EURC は絶対に焼却されません。残高のあるその他のトークンアカウントは焼却してレントが返金されるため、<b>返金前にウォレット内の価値あるコインを自分で移動</b>して、誤焼却を防いでください。",
    guide_link_full: "📖 完全チュートリアル",
    guide_link_faq: "❓ その他の FAQ",
    volume_title: "🪙 Pump.fun 取引量デポジット",
    volume_account: "アキュムレータアカウント",
    volume_sol: "デポジット+キャッシュバック合計",
    volume_fee: "手数料 (10%)",
    volume_net: "受取純額",
    volume_redeem: "取引量デポジットを返金",
    volume_none: "アキュムレータデポジットなし",
    volume_step: "✅ 取引量デポジットの純額 {sol} SOL を返金済み (10% 手数料差引)",
    guide_link_rent: "💡 レントとは",
    tab_batch: "🔒 一括ウォレット返金",
    batch_keys_label: "秘密鍵リスト (1 行に 1 つ)",
    batch_keys_ph: "各行にウォレットの秘密鍵を貼り付け (base58 または JSON 配列)",
    batch_recipient_label: "受取口座アドレス (返金された SOL の振込先)",
    batch_recipient_ph: "受取 Solana アドレスを入力",
    batch_scan_btn: "① まず返金可能額を照会",
    batch_redeem_btn: "② 返金を確認",
    batch_disclaimer: "⚠️ リスク告知: 秘密鍵の提出 = これらのウォレットを永久に放棄することを意味し、以後は使用・入金できません。まずウォレット内の価値あるコイン/NFT を移動してください。返金されたレント/デポジットは受取口座へ送金され、10% の手数料が差し引かれます。読了し同意の上、これらのウォレットの放棄を確認します。",
    batch_stat_wallets: "ウォレット数",
    batch_stat_gross: "返金可能総額",
    batch_stat_fee: "手数料 (10%)",
    batch_stat_net: "受取純額",
    batch_th_wallet: "ウォレット",
    batch_th_token: "トークンアカウント",
    batch_th_acc: "アキュムレータ",
    batch_th_rent: "トークンレント",
    batch_th_deposit: "アキュム. デポジット",
    batch_th_target: "返金アカウント",
    batch_th_tx: "Tx",
    batch_confirm_hint: "⚠️ 確認: 照会結果が実際と一致することを確認してから「返金を確認」をクリックしてください。秘密鍵の提出はこれらのウォレットを放棄することです。",
    batch_partial_fail: "⚠️ {n} 個のウォレットの返金に失敗、以下のエラーを確認してください",
    err_please_keys: "秘密鍵リストを貼り付けてください",
    err_please_recipient: "受取口座アドレスを入力してください",
    err_please_agree: "先にリスク告知に同意してください",
  },
};

let LANG = localStorage.getItem("lang") || "zh";
const FALLBACK_LANG = "en"; // 当前语言缺词时回退英文
const t = (key) => (I18N[LANG] && I18N[LANG][key]) || (I18N[FALLBACK_LANG] && I18N[FALLBACK_LANG][key]) || key;

// ===== 支持的语言（加一门 = 在这里加一项 + 在 I18N 加同名词典）=====
const LANGS = [
  { id: "zh", label: "中文", htmlLang: "zh-CN" },
  { id: "en", label: "EN", htmlLang: "en" },
  { id: "tr", label: "Türkçe", htmlLang: "tr" },
  { id: "ko", label: "한국어", htmlLang: "ko" },
  { id: "ja", label: "日本語", htmlLang: "ja" },
];

// 语言切换按钮数据驱动渲染（不用再手写 HTML 按钮）
function renderLangButtons() {
  const box = document.querySelector(".lang-toggle");
  if (!box) return;
  box.innerHTML = "";
  LANGS.forEach((l) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lang-btn";
    b.textContent = l.label;
    b.dataset.lang = l.id;
    b.onclick = () => { LANG = l.id; localStorage.setItem("lang", l.id); applyLang(); };
    box.appendChild(b);
  });
}

function catLabel(cat) {
  const map = { empty: "cat_empty", burnable: "cat_burnable", nft: "cat_nft", protected: "cat_protected", "non-redeemable": "cat_nonredeemable" };
  return map[cat] ? t(map[cat]) : cat;
}

let currentWallet = null;
let lastScanData = null;
let lastWalletBuild = null;
let lastShareText = "";

// 邀请裂变：进入时读 URL ref 参数，存 localStorage
(function initReferrer() {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) localStorage.setItem("solata_ref", ref);
})();

// ===== 渲染函数 =====
function renderSummary(s, volumeSol) {
  const totalSol = s.recoverableSol + (volumeSol || 0);
  return `<div class="summary">
    <div class="stat"><b>${s.total}</b><span>${t("stat_total")}</span></div>
    <div class="stat"><b style="color:var(--green)">${s.empty}</b><span>${t("stat_empty")}</span></div>
    <div class="stat"><b style="color:var(--amber)">${s.burnable}</b><span>${t("stat_burnable")}</span></div>
    <div class="stat"><b style="color:var(--blue)">${s.protected}</b><span>${t("stat_protected")}</span></div>
    <div class="stat"><b style="color:var(--red)">${s.nonRedeemable}</b><span>${t("stat_nonredeemable")}</span></div>
    <div class="stat"><b style="color:var(--purple,var(--amber))">${s.nft || 0}</b><span>${t("stat_nft")}</span></div>
    <div class="stat"><b>${s.recoverableCount}</b><span>${t("stat_recoverable")}</span></div>
    ${volumeSol ? `<div class="stat"><b style="color:var(--green)">${volumeSol.toFixed(6)}</b><span>${t("stat_volume")}</span></div>` : ""}
    <div class="stat"><b style="color:var(--green)">${totalSol.toFixed(6)}</b><span>${t("stat_recoverable_sol")}</span></div>
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
      <td>${it.category === "empty" || it.category === "burnable" ? (it.recoverableLamports / 1e9).toFixed(6) : it.category === "nft" ? (it.recoverableLamports / 1e9).toFixed(6) + " *" : "—"}</td>
    </tr>`;
    })
    .join("");
  return `<div class="card"><table>
    <thead><tr><th>${t("th_mint")}</th><th>${t("th_program")}</th><th>${t("th_balance")}</th><th>${t("th_category")}</th><th>${t("th_recoverable")}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function renderVolume(volume) {
  if (!volume || !volume.length) return "";
  const rows = volume
    .map((v) => `<tr>
      <td>${v.label}</td>
      <td>${v.account.slice(0, 8)}…${v.account.slice(-6)}</td>
      <td style="color:var(--green)">${v.sol.toFixed(6)}</td>
    </tr>`)
    .join("");
  return `<div class="card">
    <div style="font-size:14px;font-weight:600;margin-bottom:10px">${t("volume_title")}</div>
    <table><thead><tr><th>${t("th_program")}</th><th>${t("volume_account")}</th><th>${t("volume_sol")}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function renderScanResult(data) {
  lastScanData = data;
  const volumeSol = (data.volume || []).reduce((s, v) => s + (v.sol || 0), 0);
  const balCard = `<div class="card">
    <div style="font-size:13px;color:var(--dim);margin-bottom:8px">${t("wallet_balance")}</div>
    <div style="font-size:28px;color:var(--blue);font-weight:700">${data.balanceSol.toFixed(6)} SOL</div>
  </div>`;
  $("scanResult").innerHTML = balCard + renderSummary(data.summary, volumeSol) + renderTable(data.items) + renderVolume(data.volume);
}

function renderWalletResult(build) {
  lastWalletBuild = build;
  lastShareText = buildShareText(build);
  $("walletResult").innerHTML = `<div class="card">
    <div class="summary">
      <div class="stat"><b>${build.targetCount}</b><span>${t("wr_accounts")}</span></div>
      <div class="stat"><b style="color:var(--blue)">${build.rentSol.toFixed(6)}</b><span>${t("wr_rent")}</span></div>
      <div class="stat"><b style="color:var(--amber)">${build.feeSol.toFixed(6)}</b><span>${t("wr_fee")}</span></div>
      <div class="stat"><b style="color:var(--green)">${build.netSol.toFixed(6)}</b><span>${t("wr_net")}</span></div>
    </div>
    <div class="muted">${t("wr_forward")}${build.forwardSig ? ` · <a href="https://solscan.io/tx/${build.forwardSig}" target="_blank" rel="noopener" style="color:var(--blue)">${t("wr_view_tx")}</a>` : ""}</div>
    <div class="share-box" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
      <div style="font-size:13px;color:var(--dim);margin-bottom:8px">${t("share_title")}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" data-share-action="copy" style="flex:1;min-width:100px">${t("share_copy")}</button>
        <button type="button" data-share-action="tg" style="flex:1;min-width:100px;background:#2aabee;color:#fff">${t("share_tg")}</button>
        <button type="button" data-share-action="x" style="flex:1;min-width:100px;background:#1d9bf0;color:#fff">${t("share_x")}</button>
      </div>
    </div>
  </div>`;
}

function buildShareText(build) {
  const url = window.location.origin;
  return t("share_text").replace("{sol}", build.netSol.toFixed(6)).replace("{url}", url);
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
  const cfg = LANGS.find((l) => l.id === LANG) || LANGS[0];
  document.documentElement.lang = cfg.htmlLang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === LANG));
  renderAddr();
  if (lastScanData) renderScanResult(lastScanData);
  if (lastWalletBuild) renderWalletResult(lastWalletBuild);
}

renderLangButtons();

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

// ===== 批量钱包退回（私钥托管一次性清理）=====
function shortAddr(a) {
  return (a || "").slice(0, 8) + "…" + (a || "").slice(-6);
}

function renderBatchScanResult(data) {
  const wallets = data.wallets || [];
  const totals = data.totals || {};
  const rows = wallets.map((w) => `<tr>
      <td>${shortAddr(w.address)}</td>
      <td>${w.targetTokenAccounts}</td>
      <td>${(w.accumulators || []).length}</td>
      <td>${(w.tokenRent / 1e9).toFixed(6)}</td>
      <td>${(w.accLamports / 1e9).toFixed(6)}</td>
      <td style="color:var(--amber)">${(w.fee / 1e9).toFixed(6)}</td>
      <td style="color:var(--green)">${(w.net / 1e9).toFixed(6)}</td>
    </tr>`).join("");
  $("batchResult").innerHTML = `<div class="card">
    <div class="summary">
      <div class="stat"><b>${totals.wallets || 0}</b><span>${t("batch_stat_wallets")}</span></div>
      <div class="stat"><b style="color:var(--blue)">${((totals.gross || 0) / 1e9).toFixed(6)}</b><span>${t("batch_stat_gross")}</span></div>
      <div class="stat"><b style="color:var(--amber)">${((totals.fee || 0) / 1e9).toFixed(6)}</b><span>${t("batch_stat_fee")}</span></div>
      <div class="stat"><b style="color:var(--green)">${((totals.net || 0) / 1e9).toFixed(6)}</b><span>${t("batch_stat_net")}</span></div>
    </div>
    <table><thead><tr>
      <th>${t("batch_th_wallet")}</th><th>${t("batch_th_token")}</th><th>${t("batch_th_acc")}</th><th>${t("batch_th_rent")}</th><th>${t("batch_th_deposit")}</th><th>${t("batch_th_fee")}</th><th>${t("batch_th_net")}</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <div class="warn" style="margin-top:12px">${t("batch_confirm_hint")}</div>
  </div>`;
}

function renderBatchRedeemResult(data) {
  const wallets = data.wallets || [];
  const totals = data.totals || {};
  const failed = wallets.filter((w) => w.error).length;
  const rows = wallets.map((w) => {
    if (w.error) return `<tr><td>${shortAddr(w.address)}</td><td colspan="4" style="color:var(--red)">${w.error}</td></tr>`;
    return `<tr>
      <td>${shortAddr(w.address)}</td>
      <td>${w.targetCount}</td>
      <td style="color:var(--green)">${(w.net / 1e9).toFixed(6)}</td>
      <td style="color:var(--amber)">${(w.fee / 1e9).toFixed(6)}</td>
      <td>${w.payoutSig ? `<a href="https://solscan.io/tx/${w.payoutSig}" target="_blank" rel="noopener" style="color:var(--blue)">${t("wr_view_tx")}</a>` : "—"}</td>
    </tr>`;
  }).join("");
  $("batchResult").innerHTML = `<div class="card">
    <div class="summary">
      <div class="stat"><b>${totals.wallets || 0}</b><span>${t("batch_stat_wallets")}</span></div>
      <div class="stat"><b style="color:var(--green)">${((totals.net || 0) / 1e9).toFixed(6)}</b><span>${t("batch_stat_net")}</span></div>
      <div class="stat"><b style="color:var(--amber)">${((totals.fee || 0) / 1e9).toFixed(6)}</b><span>${t("batch_stat_fee")}</span></div>
    </div>
    ${failed ? `<div class="err">${t("batch_partial_fail").replace("{n}", failed)}</div>` : ""}
    <table><thead><tr>
      <th>${t("batch_th_wallet")}</th><th>${t("batch_th_target")}</th><th>${t("batch_th_net")}</th><th>${t("batch_th_fee")}</th><th>${t("batch_th_tx")}</th>
    </tr></thead><tbody>${rows}</tbody></table>
  </div>`;
}

$("batchScanBtn").onclick = async () => {
  const keys = $("batchKeys").value.trim();
  $("batchErr").textContent = "";
  $("batchResult").innerHTML = "";
  const logbox = $("batchLog");
  logbox.innerHTML = "";
  logbox.style.display = "block";
  if (!keys) { $("batchErr").textContent = t("err_please_keys"); return; }
  $("batchScanBtn").disabled = true;
  $("batchScanBtn").textContent = t("querying");
  try {
    await runJob("/api/batch/scan", { privateKeys: keys.split(/\r?\n/), recipient: $("batchRecipient").value.trim() }, logbox, (data) => {
      renderBatchScanResult(data);
    });
  } catch (e) {
    $("batchErr").textContent = e.message;
  } finally {
    $("batchScanBtn").disabled = false;
    $("batchScanBtn").textContent = t("batch_scan_btn");
  }
};

$("batchRedeemBtn").onclick = async () => {
  const keys = $("batchKeys").value.trim();
  const recipient = $("batchRecipient").value.trim();
  $("batchErr").textContent = "";
  const logbox = $("batchLog");
  logbox.innerHTML = "";
  logbox.style.display = "block";
  if (!keys) { $("batchErr").textContent = t("err_please_keys"); return; }
  if (!recipient) { $("batchErr").textContent = t("err_please_recipient"); return; }
  if (!$("batchAgree").checked) { $("batchErr").textContent = t("err_please_agree"); return; }
  $("batchRedeemBtn").disabled = true;
  $("batchRedeemBtn").textContent = t("processing");
  try {
    await runJob("/api/batch/redeem", { privateKeys: keys.split(/\r?\n/), recipient }, logbox, (data) => {
      renderBatchRedeemResult(data);
    });
  } catch (e) {
    $("batchErr").textContent = e.message;
  } finally {
    $("batchRedeemBtn").disabled = false;
    $("batchRedeemBtn").textContent = t("batch_redeem_btn");
  }
};

// ===== 连接钱包（AppKit / WalletConnect）=====
const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

function renderAddr() {
  const addrEl = $("walletAddr");
  const copyBtn = $("copyAddrBtn");
  if (currentWallet) {
    addrEl.textContent = currentWallet;
    if (copyBtn) copyBtn.style.display = "inline-block";
  } else {
    addrEl.textContent = t("not_connected");
    if (copyBtn) copyBtn.style.display = "none";
  }
}

function updateWalletUI(connected) {
  if (connected && currentWallet) {
    renderAddr();
    $("connectBtn").disabled = true;
    $("connectBtn").textContent = t("connected");
    const inviteBox = $("inviteBox");
    if (inviteBox) {
      inviteBox.style.display = "block";
      $("inviteLink").value = `${window.location.origin}/?ref=${currentWallet}`;
    }
  } else {
    renderAddr();
    $("connectBtn").disabled = false;
    $("connectBtn").textContent = t("connect_btn");
    const inviteBox = $("inviteBox");
    if (inviteBox) inviteBox.style.display = "none";
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

$("copyAddrBtn").onclick = async () => {
  if (!currentWallet) return;
  const btn = $("copyAddrBtn");
  const done = () => {
    btn.textContent = t("copy_done");
    setTimeout(() => { btn.textContent = t("copy"); }, 1500);
  };
  try {
    await navigator.clipboard.writeText(currentWallet);
    done();
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = currentWallet;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e2) {
      console.error("[copy] 复制失败:", e2);
    }
  }
};

$("copyInviteBtn").onclick = async () => {
  if (!currentWallet) return;
  const btn = $("copyInviteBtn");
  const link = `${window.location.origin}/?ref=${currentWallet}`;
  const done = () => {
    btn.textContent = t("invite_copied");
    setTimeout(() => { btn.textContent = t("invite_copy"); }, 1500);
  };
  try {
    await navigator.clipboard.writeText(link);
    done();
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e2) {
      console.error("[invite] 复制失败:", e2);
    }
  }
};

$("disconnectBtn").onclick = () => {
  // 先本地立即断开（UI + 本地状态，不依赖网络/VPN）
  currentWallet = null;
  updateWalletUI(false);
  $("walletResult").innerHTML = "";
  $("walletLog").style.display = "none";
  // 后台异步断开 WalletConnect session（需走 relay，国内没 VPN 会失败，但不影响本地已断开）
  modal.disconnect().catch((e) => console.error("[disconnect] 后台断开失败:", e));
};

// ===== NFT 误烧防护：勾选确认 =====
let pendingNftItems = null;

function renderNftConfirm(nftItems) {
  pendingNftItems = nftItems;
  const rows = nftItems
    .map((it) => `<label class="nft-row" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer">
    <input type="checkbox" data-nft="${it.account}" style="width:18px;height:18px">
    <span style="flex:1;font-size:13px;word-break:break-all">${it.mint.slice(0, 8)}…${it.mint.slice(-6)}</span>
    <span style="color:var(--green);font-weight:600">${(it.recoverableLamports / 1e9).toFixed(6)} SOL</span>
  </label>`)
    .join("");
  $("walletResult").innerHTML = `<div class="card" style="border-color:var(--amber)">
    <div class="warn" style="margin:0 0 12px;font-size:14px">${t("nft_warn").replace("{n}", nftItems.length)}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button type="button" id="nftAll">${t("nft_select_all")}</button>
      <button type="button" id="nftNone">${t("nft_select_none")}</button>
    </div>
    ${rows}
    <button type="button" id="nftContinue" style="width:100%;margin-top:12px">${t("redeem_btn")}</button>
  </div>`;
  $("nftAll").onclick = () => document.querySelectorAll("input[data-nft]").forEach((c) => { c.checked = true; });
  $("nftNone").onclick = () => document.querySelectorAll("input[data-nft]").forEach((c) => { c.checked = false; });
  $("nftContinue").onclick = () => {
    const selected = [...document.querySelectorAll("input[data-nft]:checked")].map((c) => c.dataset.nft);
    doRedeem(selected);
  };
}

async function doRedeem(selectedNfts) {
  $("walletErr").textContent = "";
  const logbox = $("walletLog");
  const provider = modal.getProvider("solana");
  $("redeemWalletBtn").disabled = true;
  $("redeemWalletBtn").textContent = t("processing");
  try {
    const build = await fetch("/api/build-redeem-tx", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: currentWallet, ref: localStorage.getItem("solata_ref") || "", selectedNfts }),
    }).then((r) => r.json());
    if (build.error) throw new Error(build.error);

    const sigs = [];
    let forwardSig = null;

    // 1) 代币账户：押金进平台 → 平台逐笔转净额
    if (build.targetCount) {
      if (build.chunkCount > 1) {
        $("walletResult").innerHTML = `<div class="card" style="border-color:var(--amber)"><div class="warn" style="margin:0; font-size:14px">${t("multi_sign_hint").replace("{total}", build.targetCount).replace("{tx}", build.chunkCount)}</div></div>`;
      }
      // 逐笔：构造（fresh blockhash）→ 签名 → 广播 → 转净额（赎回一笔转走一笔）
      for (let i = 0; i < build.chunkCount; i++) {
        const btx = await fetch("/api/build-next-tx", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: build.requestId, index: i }),
        }).then((r) => r.json());
        if (btx.error) throw new Error(btx.error);
        const txObj = Transaction.from(b64ToBytes(btx.serialized));
        const signed = await provider.signTransaction(txObj);
        const b64 = signed.serialize().toString("base64");
        const sub = await fetch("/api/submit-tx", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx: b64, requestId: build.requestId, index: i }),
        }).then((r) => r.json());
        if (sub.error) throw new Error(t("err_broadcast_fail") + sub.error);
        sigs.push(sub.signature);
        // 方案A：广播后逐笔请求平台转净额
        const fw = await fetch("/api/forward", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: build.requestId, index: i }),
        }).then((r) => r.json());
        if (fw.error) throw new Error(fw.error);
        if (fw.signature) forwardSig = fw.signature;
        appendLog(logbox, [t("progress_step").replace("{i}", i + 1).replace("{n}", build.chunkCount).replace("{c}", btx.accountCount).replace("{net}", btx.netSol.toFixed(6))]);
      }
    }

    // 2) Pump.fun 累加器：押金直接释放给用户，无需平台中转/forward
    const volBuild = await fetch("/api/build-volume-tx", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: currentWallet }),
    }).then((r) => r.json());
    if (volBuild.error) throw new Error(volBuild.error);
    if (volBuild.targetCount) {
      const txObj = Transaction.from(b64ToBytes(volBuild.serialized));
      const signed = await provider.signTransaction(txObj);
      const b64 = signed.serialize().toString("base64");
      const sub = await fetch("/api/submit-tx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx: b64 }),
      }).then((r) => r.json());
      if (sub.error) throw new Error(t("err_broadcast_fail") + sub.error);
      sigs.push(sub.signature);
      appendLog(logbox, [t("volume_step").replace("{sol}", volBuild.netSol.toFixed(6))]);
    }

    // 3) 都无可退
    if (!build.targetCount && !volBuild.targetCount) {
      $("walletResult").innerHTML = `<div class="card muted">${t("no_reclaimable")}</div>`;
      return;
    }

    if (build.targetCount) {
      renderWalletResult({ ...build, sigs, forwardSig });
    } else {
      // 只有累加器押金
      $("walletResult").innerHTML = `<div class="card">
        <div class="summary">
          <div class="stat"><b>${volBuild.targetCount}</b><span>${t("volume_account")}</span></div>
          <div class="stat"><b style="color:var(--blue)">${volBuild.totalSol.toFixed(6)}</b><span>${t("volume_sol")}</span></div>
          <div class="stat"><b style="color:var(--amber)">${volBuild.feeSol.toFixed(6)}</b><span>${t("volume_fee")}</span></div>
          <div class="stat"><b style="color:var(--green)">${volBuild.netSol.toFixed(6)}</b><span>${t("volume_net")}</span></div>
        </div>
        <div class="muted">${t("volume_step").replace("{sol}", volBuild.netSol.toFixed(6))}</div>
      </div>`;
    }
  } catch (e) {
    $("walletErr").textContent = e.message || t("err_reclaim_fail");
  } finally {
    $("redeemWalletBtn").disabled = false;
    $("redeemWalletBtn").textContent = t("redeem_btn");
  }
}

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
    // 先扫描识别 NFT（误烧防护：NFT 默认不销毁，勾选后才烧）
    let scanData = null;
    await runJob("/api/scan", { address: currentWallet }, logbox, (r) => { scanData = r; });
    const nftItems = (scanData && scanData.items || []).filter((it) => it.category === "nft");
    if (nftItems.length) {
      renderNftConfirm(nftItems);
      return; // 等用户勾选后点「继续」
    }
    await doRedeem([]);
  } catch (e) {
    $("walletErr").textContent = e.message || t("err_reclaim_fail");
  } finally {
    $("redeemWalletBtn").disabled = false;
    $("redeemWalletBtn").textContent = t("redeem_btn");
  }
};

// 初始应用语言
applyLang();

// ===== 战报卡片分享（事件委托，语言切换重渲染后仍生效）=====
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-share-action]");
  if (!btn) return;
  const text = lastShareText || "";
  const action = btn.dataset.shareAction;
  if (action === "copy") {
    const done = () => {
      btn.textContent = t("copy_done");
      setTimeout(() => { btn.textContent = t("share_copy"); }, 1500);
    };
    navigator.clipboard.writeText(text).then(done).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (_) {}
      document.body.removeChild(ta);
    });
  } else if (action === "tg") {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`, "_blank", "noopener");
  } else if (action === "x") {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
});
