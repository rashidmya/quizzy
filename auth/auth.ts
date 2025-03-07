// next-auth
import NextAuth from "next-auth";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// auth.config
import { authConfig } from "./auth.config";
// db
import { getUser } from "@/lib/db/queries/users";
// bcrypt
import { compare } from "bcrypt-ts";

// Extend the Session type to include an id.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Example user verification function.
// Replace with your actual logic.
async function verifyUser(email: string, password: string) {
  if (email === "jsmith@example.com" && password === "password") {
    return { id: "1", name: "John Smith", email: "jsmith@example.com" };
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  ...authConfig,
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
        if (user.length === 0) return null;

        const passwordsMatch = await compare(password, user[0].password!);
        if (passwordsMatch) return user[0];

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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
