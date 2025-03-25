import { db } from "../drizzle";
import {
  quizzes,
  questions,
  choices,
  users,
  quizAttempts,
  attemptAnswers,
} from "../schema";
import { and, eq, sql } from "drizzle-orm";

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
      timer: quizzes.timer,
      timerMode: quizzes.timerMode,
      isLive: quizzes.isLive,
      shuffleQuestions: quizzes.shuffleQuestions
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.createdBy, users.id))
    .where(eq(quizzes.createdBy, userId));
}

export async function getParticipantCount(quizId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  return result[0]?.count || 0;
}

export async function getQuizWithQuestions(quizId: string) {
  try {
    const quizResult = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdBy: {
          id: users.id,
          name: users.name,
        },
        timer: quizzes.timer,
        timerMode: quizzes.timerMode,
        isLive: quizzes.isLive,
        shuffleQuestions: quizzes.shuffleQuestions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.id, quizId));

    if (!quizResult.length) return null;

    const quiz = quizResult[0];

    // Query the associated questions.
    const questionsResult = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // For each question, query the associated choices.
    const questionsWithChoices = await Promise.all(
      questionsResult.map(async (question) => {
        const choicesResult = await db
          .select()
          .from(choices)
          .where(eq(choices.questionId, question.id));
        return { ...question, choices: choicesResult };
      })
    );

    return { ...quiz, questions: questionsWithChoices };
  } catch (error) {
    console.error("Failed to fetch quiz with questions:", error);
    throw new Error("Failed to fetch quiz with questions");
  }
}

export async function getQuizAttemptsByQuizId(quizId: string) {
  try {
    // Get all attempts for this quiz
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId));

    // For each attempt, get the related answers
    const attemptsWithAnswers = await Promise.all(
      attempts.map(async (attempt) => {
        const answers = await db
          .select({
            id: attemptAnswers.id,
            attemptId: attemptAnswers.attemptId,
            questionId: attemptAnswers.questionId,
            answer: attemptAnswers.answer,
            updatedAt: attemptAnswers.updatedAt,
            questionPoints: questions.points,
            questionType: questions.type,
          })
          .from(attemptAnswers)
          .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
          .where(eq(attemptAnswers.attemptId, attempt.id));

        // Get correctness of each answer
        const answersWithCorrectness = await Promise.all(
          answers.map(async (answer) => {
            // For simplicity, we're going to assume the answer is the choice ID
            // In a real app, you might have more complex logic based on question type
            const isCorrect = await db
              .select()
              .from(choices)
              .where(
                and(eq(choices.id, answer.answer), eq(choices.isCorrect, true))
              );

            return {
              ...answer,
              isCorrect: isCorrect.length > 0,
            };
          })
        );

        return {
          ...attempt,
          answers: answersWithCorrectness,
        };
      })
    );

    return attemptsWithAnswers;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw new Error("Failed to fetch quiz attempts");
  }
}
