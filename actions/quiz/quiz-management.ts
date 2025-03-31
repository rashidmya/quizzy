"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
  quizzes,
  questions,
  multipleChoiceDetails,
  trueFalseDetails,
  fillInBlankDetails,
  openEndedDetails,
} from "@/lib/db/schema";

import { TimerMode, QuizStatus } from "@/types/quiz";

/**
 * Creates or updates a quiz (and its questions/answers).
 */
export async function upsertQuiz(formData: FormData) {
  try {
    const userId = formData.get("userId") as string | null;
    const quizId = formData.get("quizId") as string | null;
    const updatedAt = new Date();
    const title = formData.get("title") as string;
    const timerMode = formData.get("timerMode") as TimerMode;
    const timerStr = formData.get("timer") as string;
    const timer = timerStr ? Number(timerStr) : null;
    const questionsJson = formData.get("questions") as string;
    const shuffleQuestionsStr = formData.get("shuffleQuestions") as string;
    const shuffleQuestions = shuffleQuestionsStr === "true";

    if (!title?.trim()) {
      return { message: "Title is required", error: true };
    }
    if (!timerMode?.trim()) {
      return { message: "Timer mode is required", error: true };
    }

    // The structure of each question now includes fields for different types.
    let quizQuestions: Array<{
      id?: string;
      text: string;
      type: "multiple_choice" | "true_false" | "fill_in_blank" | "open_ended";
      timer?: number;
      points: number;
      // For multiple choice
      choices?: Array<{ id?: string; text: string; isCorrect: boolean }>;
      // for true/false and fill in blank
      correctAnswer: boolean | string;
      // For true/false
      explanation?: string;
      // For fill in blank
      acceptedAnswers?: string; // expected as array, stored as comma-separated string
      // For open ended answer
      guidelines?: string;
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
        .set({ title, timerMode, timer, shuffleQuestions, updatedAt })
        .where(eq(quizzes.id, quizId));

      // Remove existing questions (cascade deletes detail rows).
      await db.delete(questions).where(eq(questions.quizId, quizId));

      newQuizId = quizId;
    } else {
      // Create a new quiz
      if (!userId?.trim()) {
        return { message: "User not authenticated", error: true };
      }
      const [insertedQuiz] = await db
        .insert(quizzes)
        .values({
          createdBy: userId,
          title,
          timerMode,
          timer,
          shuffleQuestions,
          status: "draft",
        })
        .returning({ id: quizzes.id });

      newQuizId = insertedQuiz.id;
    }

    // Insert new questions and their type-specific details.
    for (const q of quizQuestions) {
      const [insertedQuestion] = await db
        .insert(questions)
        .values({
          quizId: newQuizId,
          text: q.text,
          type: q.type,
          timer: q.timer,
          points: q.points,
        })
        .returning({ id: questions.id });

      // Insert into the detail table based on question type.
      switch (q.type) {
        case "multiple_choice":
          if (q.choices && q.choices.length > 0) {
            for (const c of q.choices) {
              await db.insert(multipleChoiceDetails).values({
                questionId: insertedQuestion.id,
                text: c.text,
                isCorrect: c.isCorrect,
              });
            }
          }
          break;
        case "true_false":
          await db.insert(trueFalseDetails).values({
            questionId: insertedQuestion.id,
            correctAnswer: (q.correctAnswer as boolean) ?? false,
            explanation: q.explanation || null,
          });
          break;
        case "fill_in_blank":
          await db.insert(fillInBlankDetails).values({
            questionId: insertedQuestion.id,
            correctAnswer: q.correctAnswer as string,
            acceptedAnswers: q.acceptedAnswers || null,
          });
          break;
        case "open_ended":
          await db.insert(openEndedDetails).values({
            questionId: insertedQuestion.id,
            guidelines: q.guidelines || "",
          });
          break;
        default:
          // Optionally handle unknown types.
          break;
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
 * Updates the quiz status (replacing setQuizLive)
 */
export async function setQuizStatus({
  quizId,
  status,
}: {
  quizId: string;
  status: QuizStatus;
}) {
  try {
    if (!quizId.trim()) {
      return { message: "Quiz ID is required", error: true };
    }
    await db.update(quizzes).set({ status }).where(eq(quizzes.id, quizId));

    let message = "";
    switch (status) {
      case "active":
        message = "Quiz is now active";
        break;
      case "draft":
        message = "Quiz has been set to draft";
        break;
      case "paused":
        message = "Quiz has been paused";
        break;
      case "scheduled":
        message = "Quiz has been scheduled";
        break;
      case "ended":
        message = "Quiz has ended";
        break;
      default:
        message = `Quiz status updated to ${status}`;
    }

    return { message };
  } catch (error) {
    console.error("Error setting quiz status:", error);
    return { message: "Failed to update quiz status", error: true };
  }
}

/**
 * Schedule a quiz to become active at a specified time
 */
export async function scheduleQuiz({
  quizId,
  scheduledAt,
  endedAt,
}: {
  quizId: string;
  scheduledAt: Date;
  endedAt?: Date;
}) {
  try {
    if (!quizId.trim()) {
      return { message: "Quiz ID is required", error: true };
    }

    const updateData: any = {
      status: "scheduled",
      scheduledAt,
    };

    if (endedAt) {
      updateData.endedAt = endedAt;
    }

    await db.update(quizzes).set(updateData).where(eq(quizzes.id, quizId));

    return {
      message: endedAt
        ? "Quiz has been scheduled with end time"
        : "Quiz has been scheduled",
    };
  } catch (error) {
    console.error("Error scheduling quiz:", error);
    return { message: "Failed to schedule quiz", error: true };
  }
}

/**
 * Updates quiz shuffle questions setting
 */
export async function setShuffleQuestions({
  quizId,
  shuffleQuestions,
}: {
  quizId: string;
  shuffleQuestions: boolean;
}) {
  try {
    if (!quizId.trim()) {
      return { message: "Quiz ID is required", error: true };
    }
    await db
      .update(quizzes)
      .set({ shuffleQuestions })
      .where(eq(quizzes.id, quizId));
    return {
      message: shuffleQuestions
        ? "Questions will be shuffled"
        : "Questions will not be shuffled",
    };
  } catch (error) {
    console.error("Error updating shuffle setting:", error);
    return { message: "Failed to update shuffle setting", error: true };
  }
}
