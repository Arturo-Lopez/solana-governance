import { VoteType, withCreateProposal } from "@solana/spl-governance";
import {
  PublicKey,
  TransactionInstruction,
  ComputeBudgetProgram,
  Transaction,
} from "@solana/web3.js";
import {
  connection,
  governingTokenMint,
  keypair,
  mainGovernanceId,
  programId,
  programVersion,
  realmId,
} from "./const";

const createProposal = async () => {
  const instructions: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_400_000 }),
  ];

  const voteType = VoteType.SINGLE_CHOICE;

  // PDA from: https://github.com/Mythic-Project/solana-program-library/blob/governance-v3.1.0/governance/program/src/state/token_owner_record.rs#L33
  const [tokenOwnerRecordKey] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("governance"),
      realmId.toBytes(),
      governingTokenMint.toBytes(),
      keypair.publicKey.toBytes(),
    ],
    programId
  );

  // The following conditions are required for a Survey Proposal
  // - No instructions
  // - Use Deny Option = false

  const proposalAddress = await withCreateProposal(
    instructions, // Previous instructions
    programId, // Governance program ID
    programVersion, // Governance program version
    realmId, // Realm ID
    mainGovernanceId, // Governance ID
    tokenOwnerRecordKey, // Token Owner Record ID
    "Proposal Title", // Title
    "", // Description link
    governingTokenMint, // Governing Token Mint
    keypair.publicKey, // Governance Authority --- THIS FIELD ---
    undefined, // Proposal index is not used if >=V3
    voteType, // Vote Type
    ["Yes", "No"], // Options
    false, // Use Deny Option
    keypair.publicKey, // Fee Payer
    undefined // Voter weight Record
  );

  // Create the transaction and add the instructions

  const block = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: keypair.publicKey,
    blockhash: block.blockhash,
    lastValidBlockHeight: block.lastValidBlockHeight,
  });

  transaction.add(...instructions);

  const trx = await connection.sendTransaction(transaction, [keypair]);

  console.log("Proposal Public Key:", proposalAddress.toBase58());

  console.log("Transaction Signature:", trx);
};

createProposal()
  .then(() => console.log("Proposal created successfully!"))
  .catch((error) => console.error("Error creating proposal:", error));
