"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { quizzes, questions, choices } from "@/lib/db/schema";
import { QuestionType } from "@/types/question";

// Create or update a quiz.
export async function upsertQuiz(formData: FormData) {
  // Extract common form values.
  const quizId = formData.get("quizId") as string | null;
  const title = formData.get("title") as string;
  const timerMode = formData.get("timerMode") as "quiz" | "question";
  const timerStr = formData.get("timer") as string;
  const timer = timerStr ? Number(timerStr) : undefined;
  const questionsJson = formData.get("questions") as string;

  console.log(timerMode)
  console.log(timerStr)
  console.log(timer)

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
      .set({ title, timer: timer !== undefined ? timer : null , timerMode })
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
        title,
        createdBy: userId,
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
