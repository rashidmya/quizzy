import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authQuizOptions: NextAuthOptions = {
  debug: true, // Enable debug logs
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    // This redirect callback is optional; if you don't want automatic redirects, you can remove it.
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};

const handler = NextAuth(authQuizOptions);

export { handler as GET, handler as POST };
