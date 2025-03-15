import { Choice, Question, Quiz } from "@/lib/db/queries/quizzes";

export type QuizWithQuestions = Quiz & {
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

export type TimerMode = "quiz" | "question";

export const TIMER_MODES = ["quiz", "question"] as const;
