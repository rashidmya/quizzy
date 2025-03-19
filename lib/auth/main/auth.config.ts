// next-auth
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// db
import { getUser } from "@/lib/db/queries/users";
// bcrypt
import { compare } from "bcrypt-ts";

export const authMainOptions: NextAuthOptions = {
  debug: true,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize({ email, password }: any) {
        if (!email || !password) return null;

        const user = await getUser(email);
        if (user.length === 0) {
          return null;
        }

        const passwordsMatch = await compare(password, user[0].password!);
        if (passwordsMatch) {
          return user[0];
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
      // while this file is also used in non-Node.js environments
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return url;
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
};

const handler = NextAuth(authMainOptions);

export { handler as GET, handler as POST };
