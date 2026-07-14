import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findBetaUserByUsername } from "./app/lib/beta-users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username
            : undefined;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (!username || !password) return null;

        const betaUser = findBetaUserByUsername(username);
        if (!betaUser) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          betaUser.passwordHash
        );
        if (!passwordMatches) return null;

        return {
          id: betaUser.id,
          name: betaUser.name,
          username: betaUser.username,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
      }
      return session;
    },
  },
});
