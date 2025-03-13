"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { quizzes, questions, choices } from "@/lib/db/schema";

// Create a new quiz.
export async function newQuiz(_: any, formData: FormData) {
  // Extract form values.
  const userId = formData.get("userId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const timerStr = formData.get("timer") as string; // quiz-level timer
  const timer = timerStr ? Number(timerStr) : undefined;
  const questionsJson = formData.get("questions") as string;

  if (!userId?.trim()) {
    return { message: "User not authenticated", error: true };
  }

  if (!title.trim()) {
    return { message: "Title is required", error: true };
  }

  // Parse the questions JSON.
  let quizQuestions;
  try {
    quizQuestions = JSON.parse(questionsJson) as Array<{
      text: string;
      type: string;
      timer?: number;
      points: number;
      choices: Array<{ text: string; isCorrect: boolean }>;
    }>;
  } catch (error) {
    return { message: "Invalid questions data", error: true };
  }

  // Insert a new quiz record.
  const insertedQuiz = await db
    .insert(quizzes)
    .values({
      title,
      description,
      createdBy: userId,
      timer,
    })
    .returning({ id: quizzes.id });
  const newQuizId = insertedQuiz[0].id;

  // Process each question.
  for (const q of quizQuestions) {
    const insertedQuestion = await db
      .insert(questions)
      .values({
        quizId: newQuizId,
        text: q.text,
        type: q.type,
        timer: q.timer,
        points: q.points,
      })
      .returning({ id: questions.id });
    const newQuestionId = insertedQuestion[0].id;

    // Insert choices for the new question.
    for (const c of q.choices) {
      await db.insert(choices).values({
        questionId: newQuestionId,
        text: c.text,
        isCorrect: c.isCorrect,
      });
    }
  }

  // Revalidate the quiz page so that the new quiz is visible.
  revalidatePath(`/quiz/${newQuizId}`);

  return { message: "Quiz created successfully", quizId: newQuizId };
}

// Save (update) an existing quiz.
export async function saveQuiz(_: any, formData: FormData) {
  // Extract form values.
  const quizId = formData.get("quizId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const timerStr = formData.get("timer") as string; // quiz-level timer
  const timer = timerStr ? Number(timerStr) : undefined;
  const questionsJson = formData.get("questions") as string;

  if (!title.trim()) {
    return { message: "Title is required", error: true };
  }
  if (!quizId) {
    return { message: "Quiz ID is required", error: true };
  }

  // Update the quiz record.
  await db
    .update(quizzes)
    .set({ title, description, timer })
    .where(eq(quizzes.id, quizId));

  // Parse the questions JSON.
  let quizQuestions;
  try {
    quizQuestions = JSON.parse(questionsJson) as Array<{
      id?: string;
      text: string;
      type: string;
      timer?: number;
      points: number;
      choices: Array<{ id?: string; text: string; isCorrect: boolean }>;
    }>;
  } catch (error) {
    return { message: "Invalid questions data", error: true };
  }

  // Delete existing questions (assuming cascade deletes choices).
  await db.delete(questions).where(eq(questions.quizId, quizId));

  // Process each question from the form and insert new ones.
  for (const q of quizQuestions) {
    const insertedQuestion = await db
      .insert(questions)
      .values({
        quizId,
        text: q.text,
        type: q.type,
        timer: q.timer,
        points: q.points,
      })
      .returning({ id: questions.id });
    const newQuestionId = insertedQuestion[0].id;

    // Insert choices for the new question.
    for (const c of q.choices) {
      await db.insert(choices).values({
        questionId: newQuestionId,
        text: c.text,
        isCorrect: c.isCorrect,
      });
    }
  }

  // Revalidate the updated quiz page.
  revalidatePath(`/quiz/${quizId}`);

  return { message: "Quiz updated successfully" };
}

export async function deleteQuiz(_: any, formData: FormData) {
  // Implementation for deleting a quiz, if needed.
}
