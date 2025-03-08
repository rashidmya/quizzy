import { db } from "../drizzle";
import { users } from "../schema";
import { eq, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export async function getUser(email: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, email));
}
