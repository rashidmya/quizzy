import { db } from "../drizzle";
import {
  quizzes,
  questions,
  multipleChoiceDetails,
  users,
  quizAttempts,
  attemptAnswers,
  trueFalseDetails,
  fillInBlankDetails,
  openEndedDetails,
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
      status: quizzes.status,
      shuffleQuestions: quizzes.shuffleQuestions,
      scheduledAt: quizzes.scheduledAt,
      endedAt: quizzes.endedAt,
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
        participantCount: sql<number>`CAST((SELECT COUNT(*) FROM quiz_attempts WHERE quiz_attempts.quiz_id = ${quizzes.id}) AS INTEGER)`,

        // Calculate accuracy using CTEs to avoid nested aggregates
        accuracy: sql<number>`COALESCE(
          (WITH correct_answers AS (
            SELECT 
              qa.id as attempt_id,
              COUNT(aa.id) as total_answers,
              SUM(CASE WHEN mc.is_correct = true THEN 1 ELSE 0 END) as correct_count
            FROM quiz_attempts qa
            JOIN attempt_answers aa ON qa.id = aa.attempt_id
            JOIN ${multipleChoiceDetails} mc ON aa.answer = mc.text
            WHERE qa.quiz_id = ${quizzes.id}
            GROUP BY qa.id
          )
          SELECT CAST(
            (SUM(correct_count) * 100.0 / NULLIF(SUM(total_answers), 0))
          AS NUMERIC(5,1))
          FROM correct_answers), 0)`,

        // Calculate completion rate also avoiding nested aggregates
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
        createdBy: {
          id: users.id,
          name: users.name,
        },

        status: quizzes.status,
        scheduledAt: quizzes.scheduledAt,
        endedAt: quizzes.endedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.createdBy, userId))
      .orderBy(desc(quizzes.createdAt));
  } catch (error) {
    console.error("Failed to fetch quizzes with report:", error);
    throw new Error("Failed to fetch quizzes with report");
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
        status: quizzes.status,
        shuffleQuestions: quizzes.shuffleQuestions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        scheduledAt: quizzes.scheduledAt,
        endedAt: quizzes.endedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.id, quizId));

    if (!quizResult.length) return null;
    const quiz = quizResult[0];

    // Get all questions for this quiz.
    const questionsResult = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // For each question, get its details based on its type.
    const questionsWithDetails = await Promise.all(
      questionsResult.map(async (question) => {
        switch (question.type) {
          case "multiple_choice": {
            const choices = await db
              .select()
              .from(multipleChoiceDetails)
              .where(eq(multipleChoiceDetails.questionId, question.id));
            return { ...question, choices };
          }
          case "true_false": {
            const details = await db
              .select()
              .from(trueFalseDetails)
              .where(eq(trueFalseDetails.questionId, question.id));
            return { ...question, ...details[0] || null };
          }
          case "fill_in_blank": {
            const details = await db
              .select()
              .from(fillInBlankDetails)
              .where(eq(fillInBlankDetails.questionId, question.id));
            return { ...question, ...details[0] || null };
          }
          case "open_ended": {
            const details = await db
              .select()
              .from(openEndedDetails)
              .where(eq(openEndedDetails.questionId, question.id));
            return { ...question, ...details[0] || null };
          }
          default:
            return question;
        }
      })
    );

    return { ...quiz, questions: questionsWithDetails };
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

        // For each answer, determine correctness based on question type.
        const answersWithCorrectness = await Promise.all(
          answers.map(async (answer) => {
            let isCorrect = false;
            if (answer.questionType === "multiple_choice") {
              // Answer is the choice ID. Check in multipleChoiceDetails.
              const mcDetail = await db
                .select()
                .from(multipleChoiceDetails)
                .where(
                  and(
                    eq(multipleChoiceDetails.text, answer.answer),
                    eq(multipleChoiceDetails.isCorrect, true)
                  )
                );
              isCorrect = mcDetail.length > 0;
            } else if (answer.questionType === "true_false") {
              // For true/false, fetch the trueFalseDetails row and compare.
              const tfDetail = await db
                .select({ correctAnswer: trueFalseDetails.correctAnswer })
                .from(trueFalseDetails)
                .where(eq(trueFalseDetails.questionId, answer.questionId));
              if (tfDetail.length > 0) {
                // Assume answer.answer is a string "true" or "false"
                isCorrect =
                  (tfDetail[0].correctAnswer === true && answer.answer === "true") ||
                  (tfDetail[0].correctAnswer === false && answer.answer === "false");
              }
            } else if (answer.questionType === "fill_in_blank") {
              // For fill-in-the-blank, compare answer with correct answer and accepted answers.
              const fibDetail = await db
                .select({
                  correctAnswer: fillInBlankDetails.correctAnswer,
                  acceptedAnswers: fillInBlankDetails.acceptedAnswers,
                })
                .from(fillInBlankDetails)
                .where(eq(fillInBlankDetails.questionId, answer.questionId));
              if (fibDetail.length > 0) {
                const detail = fibDetail[0];
                const acceptedAnswers = detail.acceptedAnswers
                  ? detail.acceptedAnswers.split(",").map(a => a.trim().toLowerCase())
                  : [];
                const given = answer.answer.trim().toLowerCase();
                isCorrect =
                  given === detail.correctAnswer.trim().toLowerCase() ||
                  acceptedAnswers.includes(given);
              }
            } else if (answer.questionType === "open_ended") {
              // Open-ended answers are typically manually graded; default to false.
              isCorrect = false;
            }
            return { ...answer, isCorrect };
          })
        );

        return { ...attempt, answers: answersWithCorrectness };
      })
    );

    return attemptsWithAnswers;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw new Error("Failed to fetch quiz attempts");
  }
}