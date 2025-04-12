import { attemptAnswers, quizAttempts } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type QuizAttempt = InferSelectModel<typeof quizAttempts>;

export type AttemptAnswer = InferSelectModel<typeof attemptAnswers>;

export type AttemptAnswerWithCorrectness = AttemptAnswer & {
  isCorrect: boolean;
  questionPoints: number | null;
  questionType: string | null;
};

export type QuizAttemptWithAnswers = QuizAttempt & {
  answers: AttemptAnswerWithCorrectness[];
};
