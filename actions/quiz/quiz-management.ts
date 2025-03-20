"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/drizzle";
import { quizzes, questions, choices } from "@/lib/db/schema";
import { TimerMode, QuestionType } from "@/types/quiz";

/**
 * Creates or updates a quiz (and its questions/choices).
 */
export async function upsertQuiz(formData: FormData) {
  try {
    const quizId = formData.get("quizId") as string | null;
    const title = formData.get("title") as string;
    const timerMode = formData.get("timerMode") as TimerMode;
    const timerStr = formData.get("timer") as string;
    const timer = timerStr ? Number(timerStr) : null;
    const questionsJson = formData.get("questions") as string;
    const userId = formData.get("userId") as string | null;

    if (!title?.trim()) {
      return { message: "Title is required", error: true };
    }
    if (!timerMode?.trim()) {
      return { message: "Timer mode is required", error: true };
    }

    let quizQuestions: Array<{
      id?: string;
      text: string;
      type: QuestionType;
      timer?: number;
      points: number;
      choices: Array<{ id?: string; text: string; isCorrect: boolean }>;
    }>;

    try {
      quizQuestions = JSON.parse(questionsJson);
    } catch {
      return { message: "Invalid questions data", error: true };
    }

    let newQuizId: string;

    if (quizId && quizId.trim()) {
      // Update existing quiz
      await db
        .update(quizzes)
        .set({ title, timerMode, timer })
        .where(eq(quizzes.id, quizId));

      // Remove existing questions (cascade deletes choices).
      await db.delete(questions).where(eq(questions.quizId, quizId));

      newQuizId = quizId;
    } else {
      // Create a new quiz
      if (!userId?.trim()) {
        return { message: "User not authenticated", error: true };
      }
      const [insertedQuiz] = await db
        .insert(quizzes)
        .values({ createdBy: userId, title, timerMode, timer })
        .returning({ id: quizzes.id });

      newQuizId = insertedQuiz.id;
    }

    // Insert new questions/choices
    for (const q of quizQuestions) {
      const [insertedQuestion] = await db
        .insert(questions)
        .values({
          quizId: newQuizId,
          text: q.text,
          type: q.type,
          timer: q.timer,
          points: q.points ?? 1,
        })
        .returning({ id: questions.id });

      for (const c of q.choices) {
        await db.insert(choices).values({
          questionId: insertedQuestion.id,
          text: c.text,
          isCorrect: c.isCorrect,
        });
      }
    }

    revalidatePath(`/quiz/${newQuizId}`);

    const message = quizId
      ? "Quiz updated successfully"
      : "Quiz created successfully";

    return { message, quizId: newQuizId };
  } catch (error) {
    console.error("Error upserting quiz:", error);
    return { message: "Failed to upsert quiz", error: true };
  }
}

/**
 * Deletes an existing quiz.
 */
export async function deleteQuiz(quizId: string) {
  try {
    if (!quizId?.trim()) {
      return { message: "Quiz ID is required", error: true };
    }
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
    return { message: "Quiz deleted successfully" };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return { message: "Failed to delete quiz", error: true };
  }
}

/**
 * Sets a quiz to “live” or “offline.”
 */
export async function setQuizLive({
  quizId,
  isLive,
}: {
  quizId: string;
  isLive: boolean;
}) {
  try {
    if (!quizId.trim()) {
      return { message: "Quiz ID is required", error: true };
    }
    await db.update(quizzes).set({ isLive }).where(eq(quizzes.id, quizId));
    return {
      message: isLive ? "Quiz is now live" : "Quiz is now offline",
    };
  } catch (error) {
    console.error("Error setting quiz live status:", error);
    return { message: "Failed to set quiz live status", error: true };
  }
}
