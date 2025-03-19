import "next-auth";

// Extend the Session type to include an id.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface Session {
    isQuiz?: boolean;
  }
  interface JWT {
    isQuiz?: boolean;
  }
}
