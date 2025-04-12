import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  
  interface JWT {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
