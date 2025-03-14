import { hash } from "bcrypt-ts";
import { db } from "./drizzle";
import { users, quizzes, questions, choices, timerModeEnum } from "./schema";
import { QUESTION_TYPES } from "@/types/question";
import { TIMER_MODES } from "@/types/quiz";

async function main() {
  // Seed 1 sample user.
  const defaultPassword = "password";
  const hashedPassword = await hash(defaultPassword, 10);
  const insertedUsers = await db
    .insert(users)
    .values({
      name: "John Doe",
      email: "bugadev@proton.me",
      password: hashedPassword,
    })
    .returning();

  // Seed 2 sample quizzes.
  const insertedQuizzes = await db
    .insert(quizzes)
    .values(
      Array.from({ length: 2 }).map((_, i) => ({
        title: `Quiz Title ${i + 1}`,
        createdBy: insertedUsers[0].id,
        timerMode: TIMER_MODES[0],
        timer: 300,
      }))
    )
    .returning();

  // Seed questions: 3 per quiz, for a total of 6 questions.
  const insertedQuestions = [];
  for (const quiz of insertedQuizzes) {
    const questionsForQuiz = Array.from({ length: 3 }).map((_, i) => ({
      quizId: quiz.id,
      text: `Sample question ${i + 1} for quiz "${quiz.title}"?`,
      type: QUESTION_TYPES[0],
      points: 1,
    }));
    const returnedQuestions = await db
      .insert(questions)
      .values(questionsForQuiz)
      .returning();
    insertedQuestions.push(...returnedQuestions);
  }

  // Seed choices: 4 choices per question.
  for (const question of insertedQuestions) {
    const choicesForQuestion = Array.from({ length: 4 }).map((_, i) => ({
      questionId: question.id,
      text: `Choice ${i + 1} for question "${question.text}"`,
      isCorrect: i === 0, // Mark the first choice as correct.
    }));
    await db.insert(choices).values(choicesForQuestion);
  }

  console.log("Seeding complete!");
  process.exit();
}

main();
