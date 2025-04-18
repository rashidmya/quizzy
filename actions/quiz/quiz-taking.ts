// actions/quiz/quiz-taking.ts
"use server";

import { revalidatePath } from "next/cache";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { quizAttempts, attemptAnswers } from "@/lib/db/schema";
import { getAttemptAnswers as fetchAttemptAnswers } from "@/lib/db/queries/quizzes";

import { QuizAttempt } from "@/types/attempt";

/**
 * Starts or resumes a quiz attempt for a given user/email.
 */
export async function startQuizAttempt({
  email,
  quizId,
}: {
  email: string;
  quizId: string;
}): Promise<{ message: string; attempt?: QuizAttempt; error?: boolean }> {
  if (!email?.trim()) {
    return { message: "Email is required", error: true };
  }
  if (!quizId?.trim()) {
    return { message: "Quiz ID is required", error: true };
  }

  try {
    const existingAttempt = await db
      .select()
      .from(quizAttempts)
      .where(
        and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.email, email))
      )
      .then((res) => res[0]);

    if (existingAttempt) {
      if (!existingAttempt.submitted) {
        return { message: "Quiz attempt resumed", attempt: existingAttempt };
      }
      return {
        message: "Quiz already submitted",
        attempt: existingAttempt,
        error: true,
      };
    }

    // If none found, create a new attempt
    const [attempt] = await db
      .insert(quizAttempts)
      .values({ email, quizId })
      .returning();

    if (attempt) {
      return { message: "Quiz attempt started", attempt };
    }
    return { message: "Failed to start quiz attempt", error: true };
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return {
      message: "An error occurred while starting quiz attempt",
      error: true,
    };
  }
}

/**
 * Saves or updates a single answer in an ongoing quiz attempt.
 */
export async function autoSaveAnswer({
  attemptId,
  questionId,
  answer,
}: {
  attemptId: string;
  questionId: string;
  answer: string;
}): Promise<{ message: string; error?: boolean }> {
  if (!attemptId.trim() || !questionId.trim()) {
    return {
      message: "Attempt ID and Question ID are required",
      error: true,
    };
  }

  try {
    const existing = await db
      .select()
      .from(attemptAnswers)
      .where(
        and(
          eq(attemptAnswers.attemptId, attemptId),
          eq(attemptAnswers.questionId, questionId)
        )
      )
      .then((res) => res[0]);

    if (existing) {
      await db
        .update(attemptAnswers)
        .set({ answer, updatedAt: new Date() })
        .where(eq(attemptAnswers.id, existing.id));
      return { message: "Answer updated successfully" };
    }

    // If no existing record, insert a new one
    await db.insert(attemptAnswers).values({ attemptId, questionId, answer });
    return { message: "Answer saved successfully" };
  } catch (error) {
    console.error("Error auto-saving answer:", error);
    return { message: "Failed to auto-save answer", error: true };
  }
}

/**
 * Submits the quiz attempt, marking it as complete.
 */
export async function submitQuizAttempt({
  attemptId,
}: {
  attemptId: string;
}): Promise<{ message: string; error?: boolean }> {
  if (!attemptId?.trim()) {
    return { message: "Attempt ID is required", error: true };
  }
  try {
    await db
      .update(quizAttempts)
      .set({ submitted: true, takenAt: new Date() })
      .where(eq(quizAttempts.id, attemptId));

    revalidatePath(`/quiz/${attemptId}`);
    return { message: "Quiz submitted successfully" };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { message: "Failed to submit quiz", error: true };
  }
}

/**
 * Retrieves all answers for a particular attempt.
 * Wrapper around the DB query for server actions.
 */
export async function getAttemptAnswers({
  attemptId,
}: {
  attemptId: string;
}): Promise<{
  message: string;
  answers?: { questionId: string; answer: string; updatedAt?: Date; questionText?: string; answerText?: string; questionType?: string; isCorrect?: boolean }[];
  error?: boolean;
}> {
  if (!attemptId?.trim()) {
    return { message: "Attempt ID is required", error: true };
  }

  try {
    const answers = await fetchAttemptAnswers(attemptId);
    return {
      message: "Attempt answers fetched successfully",
      answers,
    };
  } catch (error) {
    console.error("Error fetching attempt answers:", error);
    return { message: "Error fetching attempt answers", error: true };
  }
}
