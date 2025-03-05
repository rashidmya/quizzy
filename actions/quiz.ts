'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { quizzes, questions, choices } from '@/lib/db/schema';

export async function saveQuiz(_: any, formData: FormData) {
    console.log(formData)
    // Extract form values.
    const quizId = formData.get("quizId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const questionsJson = formData.get("questions") as string;
  
    // Basic validation.
    if (!title.trim()) {
      return { message: "title are required" };
    }
    
      // Basic validation.
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
  
    // Process each question.
    for (const q of quizQuestions) {
      if (q.id) {
        // Update existing question.
        await db
          .update(questions)
          .set({ text: q.text })
          .where(eq(questions.id, q.id));
  
        // Remove existing choices for this question.
        await db.delete(choices).where(eq(choices.questionId, q.id));
  
        // Insert new choices.
        for (const c of q.choices) {
          await db.insert(choices).values({
            questionId: q.id,
            text: c.text,
            isCorrect: c.isCorrect,
          });
        }
      } else {
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
    }
  
    // Revalidate the cache for the updated quiz page.
    revalidatePath(`/quiz/${quizId}`);
  
    return { message: "Quiz updated successfully" };
  }

export async function deleteQuiz(_: any, formData: FormData) {

}