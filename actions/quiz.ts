'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { todos } from '@/lib/db/schema';

export async function addQuiz(_: any, formData: FormData) {

}

export async function deleteQuiz(_: any, formData: FormData) {

}