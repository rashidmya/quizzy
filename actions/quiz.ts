'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { quizzes, questions, choices } from '@/lib/db/schema';

export async function newQuiz(_: any, formData: FormData) {
  // Extract form values.
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const questionsJson = formData.get("questions") as string;

  // Basic validation.
  if (!title.trim()) {
    return { message: "Title is required" };
  }

  // Parse the questions JSON.
  let quizQuestions;
  try {
    quizQuestions = JSON.parse(questionsJson) as Array<{
      text: string;
      choices: Array<{ text: string; isCorrect: boolean }>;
    }>;
  } catch (error) {
    return { message: "Invalid questions data" };
  }

  // Insert a new quiz record.
  const insertedQuiz = await db
    .insert(quizzes)
    .values({ title, description })
    .returning({ id: quizzes.id });
  const newQuizId = insertedQuiz[0].id;

  // Process each question.
  for (const q of quizQuestions) {
    // Insert new question.
    const insertedQuestion = await db
      .insert(questions)
      .values({ quizId: newQuizId, text: q.text })
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

export async function saveQuiz(_: any, formData: FormData) {
  console.log(formData);
  // Extract form values.
  const quizId = formData.get("quizId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const questionsJson = formData.get("questions") as string;

  // Basic validation.
  if (!title.trim()) {
    return { message: "Title is required" };
  }
  if (!quizId) {
    return { message: "Quiz ID is required" };
  }

  // Update the quiz record.
  await db
    .update(quizzes)
    .set({ title, description })
    .where(eq(quizzes.id, quizId));

  // Parse the questions JSON.
  let quizQuestions;
  try {
    quizQuestions = JSON.parse(questionsJson) as Array<{
      id?: string;
      text: string;
      choices: Array<{ id?: string; text: string; isCorrect: boolean }>;
    }>;
  } catch (error) {
    return { message: "Invalid questions data" };
  }

  // Delete existing questions (and their choices if cascade is set) for this quiz.
  // If your database schema doesn't cascade deletes from questions to choices,
  // you'll need to delete choices separately.
  await db.delete(questions).where(eq(questions.quizId, quizId));

  // Process each question from the form and insert new ones.
  for (const q of quizQuestions) {
    // Insert a new question.
    const insertedQuestion = await db
      .insert(questions)
      .values({ quizId, text: q.text })
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

  // Revalidate the cache for the updated quiz page.
  revalidatePath(`/quiz/${quizId}`);

  return { message: "Quiz updated successfully" };
}

export async function deleteQuiz(_: any, formData: FormData) {
  // Implementation for deleting a quiz, if needed.
}
