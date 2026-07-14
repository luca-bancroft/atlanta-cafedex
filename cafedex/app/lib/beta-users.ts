import "server-only";

// Closed-beta account list. There is no sign-up flow — this is the entire
// set of accounts allowed to log in for now. Passwords are never stored in
// plaintext, only bcrypt hashes, and the account data itself lives outside
// of committed source in BETA_USERS_B64 (a base64-encoded JSON array) so a
// public repo doesn't expose usernames/hashes. Base64 (not raw JSON) avoids
// Next.js's env-file variable expansion on `$`, which would otherwise
// mangle bcrypt hashes like `$2b$12$...`.
export type BetaUser = {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
};

function loadBetaUsers(): BetaUser[] {
  const encoded = process.env.BETA_USERS_B64;
  if (!encoded) {
    throw new Error(
      "Missing BETA_USERS_B64 environment variable (base64-encoded JSON array of beta accounts)."
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
  } catch (err) {
    throw new Error(
      `Failed to parse BETA_USERS_B64: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("BETA_USERS_B64 must decode to a JSON array.");
  }

  return parsed as BetaUser[];
}

const betaUsers = loadBetaUsers();

export function findBetaUserByUsername(username: string): BetaUser | undefined {
  const normalized = username.trim().toLowerCase();
  return betaUsers.find((u) => u.username.toLowerCase() === normalized);
}
