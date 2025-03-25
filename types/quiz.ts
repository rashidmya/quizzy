import {
  attemptAnswers,
  choices,
  questions,
  quizAttempts,
  quizzes,
} from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type TimerMode = "none" | "global" | "question";

export type QuestionType = "multiple_choice";

export type QuizStatus = "draft" | "scheduled" | "active" | "paused" | "ended";

export type Quiz = InferSelectModel<typeof quizzes>;

export type Question = InferSelectModel<typeof questions>;

export type Choice = InferSelectModel<typeof choices>;

export type QuizAttempt = InferSelectModel<typeof quizAttempts>;

export type AttemptAnswer = InferSelectModel<typeof attemptAnswers>;

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
  questionCount: number;
};

export interface QuizReport {
  id: string;
  title: string;
  accuracy: number;
  status: QuizStatus
  completionRate: number;
  participantCount: number;
  createdAt: Date;
  lastAttempt?: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

export type AttemptAnswerWithCorrectness = AttemptAnswer & {
  isCorrect: boolean;
  questionPoints: number | null;
  questionType: string | null;
};

export type QuizAttemptWithAnswers = Omit<QuizAttempt, "answers"> & {
  answers: AttemptAnswerWithCorrectness[];
};
