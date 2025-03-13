import { db } from "../drizzle";
import { quizzes, questions, choices, users } from "../schema";
import { eq, InferSelectModel, sql } from "drizzle-orm";

export type Quiz = InferSelectModel<typeof quizzes>;

export async function getQuizzes(userId: string) {
  return db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // Return createdBy as an object with id and name.
      createdBy: {
        id: users.id,
        name: users.name,
      },
      // Compute questionCount using a subquery.
      questionCount: sql<number>`CAST((SELECT COUNT(*) FROM questions WHERE questions.quiz_id = ${quizzes.id}) AS INTEGER)`,
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.createdBy, users.id))
    .where(eq(quizzes.createdBy, userId));
}

export type Question = InferSelectModel<typeof questions>;

export type Choice = InferSelectModel<typeof choices>;

export async function getQuizWithQuestions(quizId: string) {
  // Query the quiz details (including timer).
  const quizResult = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      createdBy: quizzes.createdBy,
      timer: quizzes.timer, // <-- Add this line
    })
    .from(quizzes)
    .where(eq(quizzes.id, quizId));

  if (!quizResult.length) return null;

  const quiz = quizResult[0];

  // Query the associated questions.
  const questionsResult = await db
    .select({
      id: questions.id,
      quizId: questions.quizId,
      text: questions.text,
      type: questions.type,
      timer: questions.timer,
      points: questions.points,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt,
    })
    .from(questions)
    .where(eq(questions.quizId, quizId));

  // For each question, query the associated choices.
  const questionsWithChoices = await Promise.all(
    questionsResult.map(async (question) => {
      const choicesResult = await db
        .select({
          id: choices.id,
          questionId: choices.questionId,
          text: choices.text,
          isCorrect: choices.isCorrect,
        })
        .from(choices)
        .where(eq(choices.questionId, question.id));
      return { ...question, choices: choicesResult };
    })
  );

  return { ...quiz, questions: questionsWithChoices };
}
