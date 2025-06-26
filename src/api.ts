import { getRealm, getGovernance } from "@solana/spl-governance";
import { connection, mainGovernanceId, realmId } from "./const";

// API Playground

const { account } = await getRealm(connection, realmId);

console.log("Realm owner:", account.communityMint.toBase58());

const governance = await getGovernance(connection, mainGovernanceId);

console.log("governances:", {
  governance,
  authority: governance.owner.toBase58(),
  account: governance.account.governedAccount.toBase58(),
});
