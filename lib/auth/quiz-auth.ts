// /pages/api/quiz-auth/[...nextauth].ts or /app/api/quiz-auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signIn as nextAuthSignIn } from "next-auth/react";

const handler = NextAuth({
  debug: true,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.quiz.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  providers: [
    CredentialsProvider({
      id: "quiz-login",
      name: "Quiz Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // This simply returns the email as the user. No password check.
        return { id: credentials.email, email: credentials.email };
      },
    }),
    GoogleProvider({
      id: "google-quiz-login",
      name: "Quiz Login with Google",
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Set isQuiz flag only if the provider is quiz-login.
        token.isQuiz = account?.provider === "quiz-login";
      }
      console.log("JWT token:", token);
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.isQuiz = token.isQuiz as boolean | undefined;
      }
      console.log("Session:", session);
      return session;
    },
    // This redirect callback is optional; if you don't want automatic redirects, you can remove it.
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };

export const signInQuiz = (provider: string, options?: Record<string, any>) => {
  const opts = { ...options, basePath: "/api/quiz-auth" };
  console.log("signInQuiz options:", opts);
  return nextAuthSignIn(provider, opts);
};
