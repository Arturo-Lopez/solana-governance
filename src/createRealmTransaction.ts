import {
  GovernanceConfig,
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
  VoteTipping,
  withCreateGovernance,
  withCreateRealm,
} from "@solana/spl-governance";
import {
  PublicKey,
  TransactionInstruction,
  ComputeBudgetProgram,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { createGovernanceThresholds } from "./config";
import { getTimestampFromDays, getTimestampFromHours } from "./utils";
import { connection, keypair, programId, programVersion } from "./const";

const realmName = "Realm - Empanada";

const maxVotingTimeInDays = 7; // Maximum voting time in days

const communityYesVotePercentage = 60; // Percentage of Yes votes required for community proposals

const TOTAL_SUPPLY = 1_000_000_000;

const creteRealm = async () => {
  const instructions: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_400_000 }),
  ];

  // --- REALM CONFIGURATION ---

  const communityMaxVoteWeightSource = new MintMaxVoteWeightSource({
    type: MintMaxVoteWeightSourceType.Absolute,
    value: new BN(TOTAL_SUPPLY),
  });

  // Example value, adjust as needed
  const minCommunityTokensToCreateAsMintValue = new BN(TOTAL_SUPPLY);

  const realmPk = await withCreateRealm(
    instructions, // Previous instructions
    programId, //  Governance program ID
    programVersion, // Governance program version
    realmName, // Realm name
    keypair.publicKey, // Realm Authority
    new PublicKey("2CLqqqxCBuJDwtToei6oKzFEvXB5g7RrK6A67K5NFHcT"), // Community Mint PEELY
    keypair.publicKey, // Payer
    undefined, // Optional council mint
    communityMaxVoteWeightSource,
    minCommunityTokensToCreateAsMintValue,
    undefined, // Community token config,
    undefined // Council token config,
  );

  const doesRealmExist = await connection.getAccountInfo(realmPk);

  if (doesRealmExist?.data) {
    throw new Error("Realm with the same name already exists.");
  }

  // --- GOVERNANCE CONFIGURATION ---

  const {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
    communityVetoVoteThreshold,
  } = createGovernanceThresholds(
    programVersion,
    communityYesVotePercentage,
    "disabled"
  );

  const VOTING_COOLOFF_TIME_DEFAULT = getTimestampFromHours(12);

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    communityVoteThreshold: communityVoteThreshold,
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // maxVotingTime = baseVotingTime + votingCoolOffTime
    // since this is actually baseVotingTime, we have to manually subtract the cooloff time.
    baseVotingTime:
      getTimestampFromDays(maxVotingTimeInDays) - VOTING_COOLOFF_TIME_DEFAULT,
    communityVoteTipping: VoteTipping.Disabled,
    councilVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN("0"),
    councilVoteThreshold: councilVoteThreshold,
    councilVetoVoteThreshold: councilVetoVoteThreshold,
    communityVetoVoteThreshold: communityVetoVoteThreshold,
    votingCoolOffTime: VOTING_COOLOFF_TIME_DEFAULT,
    depositExemptProposalCount: 10,
  });

  const mainGovernancePk = await withCreateGovernance(
    instructions, // Previous instructions
    programId, // Governance program ID
    programVersion, // Governance program version
    realmPk, // Realm public key
    undefined, // Optional governance account
    config, // Governance config
    PublicKey.default, // Token owner record public key
    keypair.publicKey, // Fee payer public key
    keypair.publicKey, // Create Authority public key
    undefined
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

  console.log("Realm Public Key:", realmPk.toBase58());
  console.log("Main Governance Public Key:", mainGovernancePk.toBase58());

  console.log("Transaction Signature:", trx);
};

creteRealm()
  .then(() => console.log("Realm created successfully!"))
  .catch((error) => console.error("Error creating realm:", error));
