import { db } from '../db/drizzle';
import { quizzes, questions, choices } from '../db/schema';
import { eq, InferSelectModel } from 'drizzle-orm';


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
    .from(quizzes)
}

export type Question = InferSelectModel<typeof questions>;
export type Choice = InferSelectModel<typeof choices>;

export async function getQuizWithQuestions(quizId: string) {
  // Query the quiz details.
  const quizResult = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
    })
    .from(quizzes)
    .where(eq(quizzes.id, quizId));

  // If the quiz doesn't exist, return null.
  if (!quizResult.length) return null;

  const quiz = quizResult[0];

  // Query the associated questions.
  const questionsResult = await db
    .select({
      id: questions.id,
      quizId: questions.quizId,
      text: questions.text,
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