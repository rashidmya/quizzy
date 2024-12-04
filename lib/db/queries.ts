import { db } from './drizzle';
import { todos } from './schema';
import { InferSelectModel } from 'drizzle-orm';

export type Todo = InferSelectModel<typeof todos>;

export async function getTodos() {
  return db
    .select({
      id: todos.id,
      text: todos.text,
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
    })
    .from(todos);
}
