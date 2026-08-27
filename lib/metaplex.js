/**
 * Metaplex Token Metadata 逆向成果（2026-08-27）
 *
 * 背景：NFT / pNFT / 版本（Edition）的「元数据账户」都挂在 Token Metadata 程序名下，
 * 不属于 Token / Token-2022 程序，常规 getTokenAccountsByOwner 扫不到。
 *
 * 程序 ID：metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
 *
 * ===== PDA 派生规则（已从官方 pda.rs 逆向确认）=====
 *   Metadata       : ["metadata", PROGRAM, mint]
 *   Master Edition : ["metadata", PROGRAM, mint, "edition"]
 *   Edition(版次)  : ["metadata", PROGRAM, mint, "edition", edition_number字符串]
 *   Token Record   : ["metadata", PROGRAM, mint, "token_record", token(ATA)]  ← pNFT 专用，注意是 ATA 不是 user
 *
 * ===== 关户指令 closeAccounts（关 metadata + master edition 退租）=====
 *   数据 = 单字节 0x39 (57)，老式单字节 opcode（Token Metadata 不是 Anchor 8 字节 discriminator）
 *   账户顺序：
 *     0 metadata   (mut)  PDA ["metadata", program, mint]
 *     1 edition    (mut)  PDA ["metadata", program, mint, "edition"]
 *     2 mint       (mut)
 *     3 authority  (signer, 只读)
 *     4 destination(mut)  租金接收方
 *   ⚠️ 硬限制（processor/close/mod.rs 源码）：authority 必须 = OWNERLESS_CLOSE_AUTHORITY、
 *      destination 必须 = OWNERLESS_CLOSE_DESTINATION（Metaplex 官方固定地址，见下方常量）。
 *      即：普通用户烧掉 NFT 后，metadata/edition 的租金**退不到自己钱包**，只能退到官方地址。
 *      （这是 Metaplex 的「无主清理」机制，防 MEV 抢孤儿账户租金）
 *   前提条件：mint supply == 0（NFT 已烧），且 mint_authority 为 None/edition/system。
 *
 * ===== 烧毁指令 burnNft（销毁 NFT 本体）=====
 *   数据 = 单字节 0x1d (29)
 *   账户顺序：
 *     0 metadata         (mut)
 *     1 owner            (mut, signer)  ← 用户（NFT holder）
 *     2 mint             (mut)
 *     3 tokenAccount     (mut)          用户的 ATA
 *     4 masterEdition    (mut)
 *     5 splTokenProgram  (只读) = TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
 *     6 collectionMetadata (mut, 可选)
 *   注：实际销毁 NFT 用 @solana/spl-token 的 createBurnInstruction 即可（NFT 就是 supply=1 的普通 token），
 *       burnNft 仅记录供参考（它有额外的 metadata/edition 校验）。
 *
 * ===== 结论（产品决策依据）=====
 *   - 用户能退的 NFT 相关租金 = 只有 ATA 租金（burn NFT + close ATA，已有能力）。
 *   - metadata / master edition / token record 的租金 → 进 Metaplex 官方地址，用户拿不到，无商业价值。
 *   - 故本模块当前只用于「NFT 识别」（判断 mint 是否真有 metadata 账户），不实现 closeAccounts 关元数据。
 */
const { PublicKey, TransactionInstruction } = require("@solana/web3.js");

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const SPL_TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// closeAccounts 的硬编码 authority / destination（Metaplex 官方「无主清理」固定地址）
const OWNERLESS_CLOSE_AUTHORITY = new PublicKey("C1oseLQExhuEzeBhsVbLtseSpVgvpHDbBj3PTevBCEBh");
const OWNERLESS_CLOSE_DESTINATION = new PublicKey("GxCXYtrnaU6JXeAza8Ugn4EE6QiFinpfn8t3Lo4UkBDX");

// 老式单字节 opcode
const OP_CLOSE_ACCOUNTS = Buffer.from([57]); // 0x39
const OP_BURN_NFT = Buffer.from([29]); // 0x1d

/** Metadata PDA: ["metadata", program, mint] */
function findMetadataPda(mint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
}

/** Master Edition PDA: ["metadata", program, mint, "edition"] */
function findMasterEditionPda(mint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
    TOKEN_METADATA_PROGRAM_ID
  );
}

/** Token Record PDA（pNFT）: ["metadata", program, mint, "token_record", ata] */
function findTokenRecordPda(mint, ata) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("token_record"),
      ata.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

/** 构造 closeAccounts 指令（关 metadata + edition，租金进 destination）。注意链上强制 destination=OWNERLESS_CLOSE_DESTINATION。 */
function buildCloseAccountsIx(mint, authority, destination = OWNERLESS_CLOSE_DESTINATION) {
  const [metadata] = findMetadataPda(mint);
  const [edition] = findMasterEditionPda(mint);
  return new TransactionInstruction({
    keys: [
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: edition, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
    ],
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: OP_CLOSE_ACCOUNTS,
  });
}

module.exports = {
  TOKEN_METADATA_PROGRAM_ID,
  SPL_TOKEN_PROGRAM_ID,
  OWNERLESS_CLOSE_AUTHORITY,
  OWNERLESS_CLOSE_DESTINATION,
  findMetadataPda,
  findMasterEditionPda,
  findTokenRecordPda,
  buildCloseAccountsIx,
};
