import "next-auth";

declare module "next-auth" {
  interface Session {
    isQuiz?: boolean;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    isQuiz?: boolean;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
