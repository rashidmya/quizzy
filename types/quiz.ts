import { Choice, Question, Quiz } from "@/lib/db/queries/quizzes";

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

export type TimerMode = "none" | "quiz" | "question";

export const TIMER_MODES = ["none", "quiz", "question"] as const;
