import { db } from "../drizzle";
import {
  quizzes,
  questions,
  choices,
  users,
  quizAttempts,
  attemptAnswers,
} from "../schema";
import { and, desc, eq, sql } from "drizzle-orm";

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
      shuffleQuestions: quizzes.shuffleQuestions,
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.createdBy, users.id))
    .where(eq(quizzes.createdBy, userId));
}

export async function getQuizzesWithReport(userId: string) {
  try {
    return db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt,
        questionCount: sql<number>`CAST((SELECT COUNT(*) FROM questions WHERE questions.quiz_id = ${quizzes.id}) AS INTEGER)`,
        participantCount: sql<number>`CAST((SELECT COUNT(*) FROM quiz_attempts WHERE quiz_attempts.quiz_id = ${quizzes.id}) AS INTEGER)`,

        // Calculate accuracy - using a simpler approach without nested aggregates
        accuracy: sql<number>`COALESCE(
        (WITH correct_answers AS (
          SELECT 
            qa.id as attempt_id,
            COUNT(aa.id) as total_answers,
            SUM(CASE WHEN c.is_correct = true THEN 1 ELSE 0 END) as correct_count
          FROM quiz_attempts qa
          JOIN attempt_answers aa ON qa.id = aa.attempt_id
          JOIN choices c ON aa.answer = c.id
          WHERE qa.quiz_id = ${quizzes.id}
          GROUP BY qa.id
        )
        SELECT CAST(
          (SUM(correct_count) * 100.0 / NULLIF(SUM(total_answers), 0))
        AS NUMERIC(5,1))
        FROM correct_answers), 0)`,

        // Calculate completion rate - also avoiding nested aggregates
        completionRate: sql<number>`COALESCE(
        (WITH question_counts AS (
          SELECT COUNT(*) as total_questions
          FROM questions 
          WHERE questions.quiz_id = ${quizzes.id}
        ),
        attempt_counts AS (
          SELECT 
            COUNT(DISTINCT qa.id) as total_attempts,
            COUNT(aa.id) as total_answers
          FROM quiz_attempts qa
          LEFT JOIN attempt_answers aa ON qa.id = aa.attempt_id
          WHERE qa.quiz_id = ${quizzes.id}
        )
        SELECT CAST(
          (total_answers * 100.0 / NULLIF(total_attempts * total_questions, 0)) 
        AS NUMERIC(5,1))
        FROM attempt_counts, question_counts), 0)`,

        // Get the most recent attempt date
        lastAttempt: sql<Date>`(
        SELECT MAX(taken_at)
        FROM quiz_attempts
        WHERE quiz_attempts.quiz_id = ${quizzes.id} AND quiz_attempts.submitted = true
      )`,

        // Author information
        author: {
          id: users.id,
          name: users.name,
        },
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.createdBy, userId))
      .orderBy(desc(quizzes.createdAt));
  } catch (error) {
    console.error("Failed to fetch quizzes with report:", error);
    throw new Error("ailed to fetch quizzes with report");
  }
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
