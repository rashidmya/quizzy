import { hash } from "bcrypt-ts";
import { db } from "./drizzle";
import {
  users,
  quizzes,
  questions,
  multipleChoiceDetails,
  trueFalseDetails,
  fillInBlankDetails,
  openEndedDetails,
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
        timerMode: TIMER_MODES[0], // e.g. "global"
        timer: null,
      }))
    )
    .returning();

  // Seed questions for each quiz.
  // For each quiz, insert one question per question type.
  const insertedQuestions: {
    id: string;
    quizId: string;
    text: string;
    type: string;
    points: number;
  }[] = [];
  for (const quiz of insertedQuizzes) {
    const questionsForQuiz = QUESTION_TYPES.map((qType, idx) => ({
      quizId: quiz.id,
      text: `Sample ${qType} question for quiz "${quiz.title}"?`,
      type: qType,
      points: 1,
    }));
    const returnedQuestions = await db
      .insert(questions)
      .values(questionsForQuiz)
      .returning();
    insertedQuestions.push(...returnedQuestions);
  }

  // For multiple choice questions, we will store the inserted choices in a Map.
  const questionChoicesMap = new Map<
    string,
    { id: string; isCorrect: boolean }[]
  >();

  // Insert details for each question based on its type.
  for (const question of insertedQuestions) {
    if (question.type === "multiple_choice") {
      // Insert 4 choices per multiple-choice question.
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
    } else if (question.type === "true_false") {
      // Insert true/false details.
      await db.insert(trueFalseDetails).values({
        questionId: question.id,
        correctAnswer: true,
        explanation: "This is a sample explanation for a true/false question.",
      });
    } else if (question.type === "fill_in_blank") {
      // Insert fill-in-the-blank details.
      await db.insert(fillInBlankDetails).values({
        questionId: question.id,
        correctAnswer: "correct",
        acceptedAnswers: "correct, right",
      });
    } else if (question.type === "open_ended") {
      // Insert open-ended details.
      await db.insert(openEndedDetails).values({
        questionId: question.id,
        guidelines: "Provide a detailed answer.",
      });
    }
  }

  // Seed quiz attempts with random attempts for each quiz.
  for (const quiz of insertedQuizzes) {
    // Filter questions for this quiz.
    const quizQuestions = insertedQuestions.filter((q) => q.quizId === quiz.id);
    // Generate a random number of attempts between 5 and 10.
    const numAttempts = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numAttempts; i++) {
      // Create a unique participant email for each attempt.
      const attemptEmail = `participant${i + 1}_${quiz.id.slice(
        0,
        4
      )}@example.com`;
      const insertedAttempt = await db
        .insert(quizAttempts)
        .values({
          email: attemptEmail,
          quizId: quiz.id,
          submitted: Math.random() < 0.8, // 80% chance the attempt is marked as submitted.
        })
        .returning();
      const attemptId = insertedAttempt[0].id;

      // Create answer records based on question type.
      const attemptAnswerRecords = quizQuestions
        .map((question) => {
          if (question.type === "multiple_choice") {
            const choicesForQuestion =
              questionChoicesMap.get(question.id) || [];
            if (choicesForQuestion.length === 0) {
              console.warn(`No choices found for question ${question.id}`);
              return null;
            }
            const randomIndex = Math.floor(
              Math.random() * choicesForQuestion.length
            );
            const chosenChoice = choicesForQuestion[randomIndex];
            return {
              attemptId,
              questionId: question.id,
              answer: chosenChoice.id,
            };
          } else if (question.type === "true_false") {
            const answer = Math.random() < 0.5 ? "true" : "false";
            return {
              attemptId,
              questionId: question.id,
              answer,
            };
          } else if (question.type === "fill_in_blank") {
            return {
              attemptId,
              questionId: question.id,
              answer: "correct",
            };
          } else if (question.type === "open_ended") {
            return {
              attemptId,
              questionId: question.id,
              answer: "This is a sample open-ended answer.",
            };
          }
          return null;
        })
        .filter(
          (
            record
          ): record is {
            attemptId: string;
            questionId: string;
            answer: string;
          } => record !== null
        );

      await db.insert(attemptAnswers).values(attemptAnswerRecords);
    }
  }

  console.log("Seeding complete!");
  process.exit();
}

main();
