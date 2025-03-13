import { Choice, Question, Quiz } from "@/lib/db/queries/quizzes";

export type QuizWithQuestions = Quiz & {
  questions: Array<Question & { choices: Choice[] }>;
};

export type LibraryQuiz = Omit<Quiz, "createdBy"> & {
  createdBy: {
    id: string;
    name: string;
  };
  questionCount?: number;
};
