import { quizzes } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Question, QuestionUnion } from "./question";

export type TimerMode = "none" | "global" | "question";

export type QuizStatus = "draft" | "scheduled" | "active" | "paused" | "ended";

export type Quiz = InferSelectModel<typeof quizzes>;

export type QuizWithQuestions = Omit<Quiz, "createdBy"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questions: (Question & QuestionUnion)[];
};

export type LibraryQuiz = Omit<Quiz, "createdBy"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questionCount: number;
};

export type QuizReport = Omit<
  Quiz,
  "createdBy" | "updatedAt" | "timerMode" | "timer" | "shuffleQuestions"
> & {
  completionRate: number;
  participantCount: number;
  accuracy: number;
  lastAttempt?: Date;
  createdBy: {
    id: string;
    name: string;
  };
};
