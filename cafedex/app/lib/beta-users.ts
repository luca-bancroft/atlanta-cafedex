import "server-only";
export type BetaUser = {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
};

export const betaUsers: BetaUser[] = [
  {
    id: "1",
    username: "LucaB_beta",
    name: "Luca B.",
    passwordHash:
      "$2b$12$JjgnqY.vG6eFRNAH1T4FUe1aZzlqc5xh218mJ9BqeOTDbKCY3RhOm",
  },
  {
    id: "2",
    username: "LucaW_beta",
    name: "Luca W.",
    passwordHash:
      "$2b$12$QSqJ3SohOu4BRDUlXa54ZOe2PeXiOig6dC5mCgFDgWccQndX6Ro0K",
  },
  {
    id: "3",
    username: "NoahP_beta",
    name: "Noah P.",
    passwordHash:
      "$2b$12$OG24ve9L4V43uncYs3n9/Oj.lVpObhxdcLCZ1ZGG7L7yF2A4EAFju",
  },
  {
    id: "4",
    username: "EvaB_beta",
    name: "Eva B.",
    passwordHash:
      "$2b$12$RnFqtDakWGdl0Uuxngoe9eu9IcWh.bv3ZV6LZE7inFDfLeIaemiHO",
  },
];

export function findBetaUserByUsername(username: string): BetaUser | undefined {
  const normalized = username.trim().toLowerCase();
  return betaUsers.find((u) => u.username.toLowerCase() === normalized);
}
