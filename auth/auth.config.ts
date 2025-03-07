import type { NextAuthOptions } from "next-auth";

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    // Add your providers here (e.g., CredentialsProvider, GoogleProvider)
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthOptions;