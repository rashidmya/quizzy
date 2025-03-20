"use server";

import { revalidatePath } from "next/cache";
// drizzle
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
// schemas
import {
  quizzes,
  questions,
  choices,
  quizAttempts,
  attemptAnswers,
} from "@/lib/db/schema";
// types
import { QuestionType } from "@/types/quiz";
import { QuizAttemps, TimerMode } from "@/types/quiz";

// Create or update a quiz.
export async function upsertQuiz(formData: FormData) {
  // Extract common form values.
  const quizId = formData.get("quizId") as string | null;
  const title = formData.get("title") as string;
  const timerMode = formData.get("timerMode") as TimerMode;
  const timerStr = formData.get("timer") as string;
  const timer = timerStr ? Number(timerStr) : null;
  const questionsJson = formData.get("questions") as string;

  // Basic validation.
  if (!title.trim()) {
    return { message: "Title is required", error: true };
  }
  if (!timerMode?.trim()) {
    return { message: "Timer mode is required", error: true };
  }

  // Parse questions JSON.
  let quizQuestions;
  try {
    quizQuestions = JSON.parse(questionsJson) as Array<{
      id?: string;
      text: string;
      type: QuestionType;
      timer?: number;
      points: number;
      choices: Array<{ id?: string; text: string; isCorrect: boolean }>;
    }>;
  } catch (error) {
    return { message: "Invalid questions data", error: true };
  }

  let newQuizId: string;

  if (quizId && quizId.trim()) {
    // UPDATE: Quiz exists.
    await db
      .update(quizzes)
      .set({ title, timerMode, timer })
      .where(eq(quizzes.id, quizId));

    // Delete existing questions (cascade deletes choices).
    await db.delete(questions).where(eq(questions.quizId, quizId));

    newQuizId = quizId;
  } else {
    // CREATE: New quiz requires a userId.
    const userId = formData.get("userId") as string;
    if (!userId?.trim()) {
      return { message: "User not authenticated", error: true };
    }

    const insertedQuiz = await db
      .insert(quizzes)
      .values({
        createdBy: userId,
        title,
        timerMode,
        timer,
      })
      .returning({ id: quizzes.id });

    newQuizId = insertedQuiz[0].id;
  }

  // Process each question – insert new questions and their choices.
  for (const q of quizQuestions) {
    const insertedQuestion = await db
      .insert(questions)
      .values({
        quizId: newQuizId,
        text: q.text,
        type: q.type,
        timer: q.timer,
        points: q.points !== undefined ? q.points : 1,
      })
      .returning({ id: questions.id });
    const newQuestionId = insertedQuestion[0].id;

    for (const c of q.choices) {
      await db.insert(choices).values({
        questionId: newQuestionId,
        text: c.text,
        isCorrect: c.isCorrect,
      });
    }
  }

  // Revalidate the quiz page.
  revalidatePath(`/quiz/${newQuizId}`);

  return {
    message: quizId ? "Quiz updated successfully" : "Quiz created successfully",
    quizId: newQuizId,
  };
}

export async function deleteQuiz(quizId: string) {
  if (!quizId.trim()) {
    return { message: "Quiz ID is required", error: true };
  }
  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return { message: "Quiz deleted successfully" };
}

export async function setQuizLive({
  quizId,
  isLive,
}: {
  quizId: string;
  isLive: boolean;
}) {
  if (!quizId.trim()) {
    return { message: "Quiz ID is required", error: true };
  }

  // Update the quiz record with the new live status.
  await db.update(quizzes).set({ isLive }).where(eq(quizzes.id, quizId));

  return { message: isLive ? "Quiz is now live" : "Quiz is now offline" };
}

// Start or resume a quiz attempt.
export async function startQuizAttempt({
  email,
  quizId,
}: {
  email: string;
  quizId: string;
}): Promise<{ message: string; attempt?: QuizAttemps; error?: boolean }> {
  if (!email.trim()) {
    return { message: "Email is required", error: true };
  }
  if (!quizId.trim()) {
    return { message: "Quiz ID is required", error: true };
  }

  try {
    const existing = await db
      .select()
      .from(quizAttempts)
      .where(
        and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.email, email))
      );
    if (existing.length > 0) {
      const existingAttempt = existing[0];
      // If not submitted, resume; if submitted, mark as error.
      if (!existingAttempt.submitted) {
        return { message: "Quiz attempt resumed", attempt: existingAttempt };
      } else {
        return {
          message: "Quiz already submitted",
          attempt: existingAttempt,
          error: true,
        };
      }
    }

    // Insert a new quiz attempt.
    const attempts = await db
      .insert(quizAttempts)
      .values({
        email,
        quizId,
        score: 0,
      })
      .returning();

    if (attempts.length > 0) {
      return { message: "Quiz attempt started", attempt: attempts[0] };
    } else {
      return { message: "Failed to start quiz attempt", error: true };
    }
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return {
      message: "An error occurred while starting quiz attempt",
      error: true,
    };
  }
}

// Auto-save an answer.
export async function autoSaveAnswer({
  attemptId,
  questionId,
  answer,
}: {
  attemptId: string;
  questionId: string;
  answer: string;
}): Promise<{ message: string; error?: boolean }> {
  if (!attemptId.trim() || !questionId.trim() || !answer.trim()) {
    return { message: "All fields are required", error: true };
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
      );
    if (existing.length > 0) {
      await db
        .update(attemptAnswers)
        .set({ answer, updatedAt: new Date() })
        .where(eq(attemptAnswers.id, existing[0].id));
      return { message: "Answer updated successfully" };
    } else {
      await db
        .insert(attemptAnswers)
        .values({ attemptId, questionId, answer })
        .returning();
      return { message: "Answer saved successfully" };
    }
  } catch (error) {
    console.error("Error auto-saving answer:", error);
    return { message: "Failed to auto-save answer", error: true };
  }
}

// Submit the quiz attempt.
export async function submitQuizAttempt({
  attemptId,
}: {
  attemptId: string;
}): Promise<{ message: string; error?: boolean }> {
  if (!attemptId.trim()) {
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
