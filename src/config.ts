import {
  GoverningTokenConfig,
  GoverningTokenType,
  PROGRAM_VERSION_V3,
  RealmConfigAccount,
  VoteThreshold,
  VoteThresholdType,
} from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";

// Copy pasted from: https://github.com/Mythic-Project/governance-ui/blob/main/tools/governance/configs.ts#L14

export function createGovernanceThresholds(
  programVersion: number,
  communityYesVotePercentage: "disabled" | number,
  // ignored if program version < v3
  councilYesVotePercentage?: "disabled" | number
) {
  // For backward compatybility with spl-gov versions <= 2
  // for Council vote and Veto vote thresholds we have to pass YesVotePerentage(0)
  const undefinedThreshold = new VoteThreshold({
    type: VoteThresholdType.YesVotePercentage,
    value: 0,
  });

  const communityVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? communityYesVotePercentage !== "disabled"
        ? new VoteThreshold({
            value: communityYesVotePercentage,
            type: VoteThresholdType.YesVotePercentage,
          })
        : new VoteThreshold({ type: VoteThresholdType.Disabled })
      : new VoteThreshold({
          value: communityYesVotePercentage as number,
          type: VoteThresholdType.YesVotePercentage,
        });

  const councilVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? councilYesVotePercentage !== "disabled" &&
        councilYesVotePercentage !== undefined
        ? new VoteThreshold({
            value: councilYesVotePercentage,
            type: VoteThresholdType.YesVotePercentage,
          })
        : new VoteThreshold({ type: VoteThresholdType.Disabled })
      : undefinedThreshold;

  const councilVetoVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? councilVoteThreshold
      : undefinedThreshold;

  const communityVetoVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? new VoteThreshold({ type: VoteThresholdType.Disabled })
      : undefinedThreshold;

  return {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
    communityVetoVoteThreshold,
  };
}

export function createDefaultRealmConfigAccount(realmPk: PublicKey) {
  const defaultTokenConfig = new GoverningTokenConfig({
    voterWeightAddin: undefined,
    maxVoterWeightAddin: undefined,
    tokenType: GoverningTokenType.Liquid,
    reserved: new Uint8Array(),
  });

  return new RealmConfigAccount({
    realm: realmPk,
    communityTokenConfig: defaultTokenConfig,
    councilTokenConfig: defaultTokenConfig,
    reserved: new Uint8Array(),
  });
}
