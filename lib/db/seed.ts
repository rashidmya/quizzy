import { hash } from "bcrypt-ts";
import { db } from "./drizzle";
import {
  users,
  quizzes,
  questions,
  multipleChoiceDetails,
  quizAttempts,
  attemptAnswers,
} from "./schema";
import { TIMER_MODES, QUESTION_TYPES } from "@/constants";

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
        timer: null,
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
  // We'll store the returned choices in a Map for later use in creating answers.
  const questionChoicesMap = new Map<string, { id: string; isCorrect: boolean }[]>();
  for (const question of insertedQuestions) {
    const choicesForQuestion = Array.from({ length: 4 }).map((_, i) => ({
      questionId: question.id,
      text: `Choice ${i + 1} for question "${question.text}"`,
      isCorrect: i === 0, // Mark the first choice as correct.
    }));
    const returnedChoices = await db
      .insert(multipleChoiceDetails)
      .values(choicesForQuestion)
      .returning();
    questionChoicesMap.set(question.id, returnedChoices);
  }

  // Seed quiz attempts with random attempts for each quiz.
  for (const quiz of insertedQuizzes) {
    // Filter questions for this quiz.
    const quizQuestions = insertedQuestions.filter(q => q.quizId === quiz.id);
    // Generate a random number of attempts between 5 and 10.
    const numAttempts = Math.floor(Math.random() * 6) + 5; // random number from 5 to 10
    for (let i = 0; i < numAttempts; i++) {
      // Create a unique participant email for each attempt.
      const attemptEmail = `participant${i + 1}_${quiz.id.slice(0, 4)}@example.com`;
      const insertedAttempt = await db
        .insert(quizAttempts)
        .values({
          email: attemptEmail,
          quizId: quiz.id,
          submitted: Math.random() < 0.8, // 80% chance the attempt is marked as submitted.
        })
        .returning();
      const attemptId = insertedAttempt[0].id;

      // For each question in this quiz, create an answer with a random choice.
      const attemptAnswerRecords = quizQuestions.map(question => {
        const choicesForQuestion = questionChoicesMap.get(question.id) || [];
        const randomIndex = Math.floor(Math.random() * choicesForQuestion.length);
        const chosenChoice = choicesForQuestion[randomIndex];
        return {
          attemptId,
          questionId: question.id,
          // Save the chosen choice id as the answer.
          answer: chosenChoice.id,
        };
      });

      await db.insert(attemptAnswers).values(attemptAnswerRecords);
    }
  }

  console.log("Seeding complete!");
  process.exit();
}

main();
