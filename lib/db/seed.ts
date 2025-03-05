// db/seed.ts
import { db } from './drizzle';
import { users, quizzes, questions, choices, quizAttempts } from './schema';

async function main() {
  // Seed 5 sample users without specifying the id.
  const insertedUsers = await db
    .insert(users)
    .values(
      Array.from({ length: 5 }).map((_, i) => ({
        email: `user${i}@example.com`,
      }))
    )
    .returning();
  
  // Seed 2 sample quizzes without specifying the id.
  const insertedQuizzes = await db
    .insert(quizzes)
    .values(
      Array.from({ length: 2 }).map((_, i) => ({
        title: `Quiz Title ${i + 1}`,
        description: `This is a description for quiz ${i + 1}.`,
      }))
    )
    .returning();

  // Seed questions: 3 per quiz, for a total of 6 questions.
  const insertedQuestions = [];
  for (const quiz of insertedQuizzes) {
    const questionsForQuiz = Array.from({ length: 3 }).map((_, i) => ({
      quizId: quiz.id,
      text: `Sample question ${i + 1} for quiz "${quiz.title}"?`,
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

  // Seed 10 sample quiz attempts with random scores (0 to 100)
  for (let i = 0; i < 10; i++) {
    const randomUser = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
    const randomQuiz = insertedQuizzes[Math.floor(Math.random() * insertedQuizzes.length)];
    await db
      .insert(quizAttempts)
      .values({
        userId: randomUser.id,
        quizId: randomQuiz.id,
        score: Math.floor(Math.random() * 101),
      });
  }

  console.log('Seeding complete!');
  process.exit();
}

main();
