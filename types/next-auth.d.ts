import "next-auth";

declare module "next-auth" {
  interface Session {
    isQuiz?: boolean;
  }
  interface JWT {
    isQuiz?: boolean;
  }
}
