import type { Config } from "drizzle-kit";

if (!process.env.POSTGRES_URL) throw Error("POSTGRES_URL not set");

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
} satisfies Config;
