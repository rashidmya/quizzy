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

export type LibraryQuiz = Omit<Quiz, "createdBy" | "questionCount"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questionCount: number;
};

export type QuizReport = Omit<
  Quiz,
  | "createdBy"
  | "completionRate"
  | "participationCount"
  | "accuracy"
  | "lastAttempt"
> & {
  createdBy: {
    id: string;
    name: string;
  };
  completionRate: number;
  participantCount: number;
  accuracy: number;
  lastAttempt?: Date;
};

export type AttemptAnswerWithCorrectness = AttemptAnswer & {
  isCorrect: boolean;
  questionPoints: number | null;
  questionType: string | null;
};

export type QuizAttemptWithAnswers = Omit<QuizAttempt, "answers"> & {
  answers: AttemptAnswerWithCorrectness[];
};
