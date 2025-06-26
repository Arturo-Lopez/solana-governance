import { Connection, Keypair, PublicKey } from "@solana/web3.js";

// General constants

export const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

export const keypair = Keypair.fromSecretKey(Uint8Array.from([]));

// Program configs

export const programId = new PublicKey(
  "7MGk2mAybH2JRj1hRqYmnrHGsbzoWTtxVNWjoaoPCJ3r"
);

// The real program version is 4 but we use 3 for compatibility
export const programVersion = 3;

// Configs for create proposal

export const realmId = new PublicKey(
  "7d6BmQ8JHabSKq5JoY2WSk4uAQsLUBn16rg7zhqGgpmn"
);

export const mainGovernanceId = new PublicKey(
  "DXfdrGexi7sY4NHhZfNBcSnGgnhxAQPSkH6yVLLnVLiv"
);

export const realmOwnerId = new PublicKey(
  "ENXKnLmAmQq7LEm11EgC6sSdwong6fWaofCT57pZWpEH"
);

export const governingTokenMint = new PublicKey(
  "2CLqqqxCBuJDwtToei6oKzFEvXB5g7RrK6A67K5NFHcT"
);
