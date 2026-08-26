/**
 * pump.fun 交易量累加器账户（UserVolumeAccumulator）扫描 + 关户
 *
 * 背景（2026-08-27 逆向自链上交易）：
 *   打狗（pump.fun 交易）时，pump.fun 会给用户创建「交易量累加器」账户（PDA），
 *   用于累计交易量 / 发放 Cashback。这类账户挂在 pump.fun 自己的程序名下，
 *   不属于 Token / Token-2022 程序，所以常规 token 账户扫描永远看不见它们。
 *   sol-incinerator 正是靠「扫别人扫不到的账户类型」多退租金。
 *
 * 关键逆向结论（2026-08-27 simulate 验证）：
 *   - PDA 派生：findProgramAddress(["user_volume_accumulator", user], program)
 *   - 两个程序共用同一套规则：
 *       6EF8rrecth…（pump.fun 老 bonding curve）+ pAMMBay…（pump.fun AMM）
 *   - CloseUserVolumeAccumulator discriminator: 0xf945a4da9667548a（无参数）
 *   - 账户布局（见下方 build 函数注释）
 *   - ⚠️ 返现（cashback）物理存在累加器账户的 lamports 里，Close 会全部释放给 user，
 *     无需先 ClaimCashback。且 pAMMBay 的 ClaimCashback 账户布局不同（还需 quote_mint 等，
 *     会报 AccountOwnedByWrongProgram 3007），故统一只 Close，不调 ClaimCashback。
 *     buildClaimCashbackIx 仅保留供参考（6EF8rrecth 可用，pAMMBay 不可用）。
 */
const { PublicKey, TransactionInstruction } = require("@solana/web3.js");
const { getAccountInfo, rpcCall } = require("./solana");

const SYSTEM_PROGRAM = new PublicKey("11111111111111111111111111111111");

// 两个 pump.fun 程序 + 各自固定的 global state（只读配置账户，链上硬编码常量）
const PUMP_PROGRAMS = [
  {
    program: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
    globalState: new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"),
    label: "pump.fun 老 bonding curve",
  },
  {
    program: new PublicKey("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"),
    globalState: new PublicKey("GS4CU59F31iL7aR2Q8zVS8DRrcRnXX1yjQ66TqNVQnaR"),
    label: "pump.fun AMM",
  },
];

// Anchor 8 字节 discriminator（hex）—— 标准 Anchor 算法 sha256("global:"+snake_case)[:8]，
// 已用 simulateTransaction 验证命中（报 AccountNotInitialized 3012，而非 InstructionFallbackNotFound 101）
const DISC_CLAIM_CASHBACK = Buffer.from("253a237ebe35e4c5", "hex"); // sha256("global:claim_cashback")
const DISC_CLOSE_VOLUME = Buffer.from("f945a4da9667548a", "hex"); // sha256("global:close_user_volume_accumulator")

/** 派生用户的 volume accumulator PDA */
function volumeAccumulatorPda(userPk, program) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_volume_accumulator"), userPk.toBuffer()],
    program
  );
}

/**
 * 扫描用户名下的 pump.fun 累加器账户（两个程序各一个，存在即有押金可退）。
 * @param {PublicKey} userPk 用户钱包
 * @returns {Array<{account, program, globalState, lamports, label, bump, sol}>}
 */
async function scanVolumeAccumulators(userPk) {
  const results = [];
  for (const p of PUMP_PROGRAMS) {
    const [accPk, bump] = volumeAccumulatorPda(userPk, p.program);
    const info = await getAccountInfo(accPk);
    if (!info) continue; // 不存在 = 无累加器账户
    results.push({
      account: accPk,
      program: p.program,
      globalState: p.globalState,
      lamports: info.lamports,
      sol: info.lamports / 1e9,
      label: p.label,
      bump,
    });
  }
  return results;
}

/**
 * 构造 ClaimCashback 指令（领取返现，若有；账户顺序逆向自链上交易）。
 * 账户: [user(signer,mut), accumulator(mut), system_program, global_state, program]
 */
function buildClaimCashbackIx(userPk, item) {
  return new TransactionInstruction({
    keys: [
      { pubkey: userPk, isSigner: true, isWritable: true },
      { pubkey: item.account, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: item.globalState, isSigner: false, isWritable: false },
      { pubkey: item.program, isSigner: false, isWritable: false },
    ],
    programId: item.program,
    data: DISC_CLAIM_CASHBACK,
  });
}

/**
 * 构造 CloseUserVolumeAccumulator 指令（关闭累加器账户，押金释放给用户）。
 * 账户: [user(signer,mut), accumulator(mut), global_state, program]
 */
function buildCloseVolumeIx(userPk, item) {
  return new TransactionInstruction({
    keys: [
      { pubkey: userPk, isSigner: true, isWritable: true },
      { pubkey: item.account, isSigner: false, isWritable: true },
      { pubkey: item.globalState, isSigner: false, isWritable: false },
      { pubkey: item.program, isSigner: false, isWritable: false },
    ],
    programId: item.program,
    data: DISC_CLOSE_VOLUME,
  });
}

module.exports = {
  PUMP_PROGRAMS,
  DISC_CLAIM_CASHBACK,
  DISC_CLOSE_VOLUME,
  volumeAccumulatorPda,
  scanVolumeAccumulators,
  buildClaimCashbackIx,
  buildCloseVolumeIx,
};
