import { choices, questions, quizAttempts, quizzes } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Quiz = InferSelectModel<typeof quizzes>;

export type Question = InferSelectModel<typeof questions>;

export type Choice = InferSelectModel<typeof choices>;

export type QuizAttemp = InferSelectModel<typeof quizAttempts>;

export type QuizWithQuestions = Omit<Quiz, "createdBy" | "questions"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questions: Array<Question & { choices: Choice[] }>;
};

export type LibraryQuiz = Omit<Quiz, "createdBy"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questionCount?: number;
};

export type TimerMode = "none" | "global" | "question";

export const TIMER_MODES = ["none", "global", "question"] as const;

export type QuestionType = "multiple_choice";

export const QUESTION_TYPES = ["multiple_choice"] as const;

