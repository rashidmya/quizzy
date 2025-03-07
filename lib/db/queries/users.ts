import { db } from '../drizzle';
import { users } from '../schema';
import { InferSelectModel } from 'drizzle-orm';

export type Todo = InferSelectModel<typeof users>;

export async function getUsers() {
  return db
    .select({
      id: users.id,
      password: users.password,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);
}