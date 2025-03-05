import { db } from './db/drizzle';
import { quizzes } from './db/schema';
import { InferSelectModel } from 'drizzle-orm';


export type Quiz = InferSelectModel<typeof quizzes>;

export async function getQuizzes() {
  return db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,

    })
    .from(quizzes);
}
