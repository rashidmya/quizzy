import { Choice, Question, Quiz } from "@/lib/db/queries/quizzes";


export type QuizWithQuestions = Quiz & {
  questions: Array<Question & { choices: Choice[] }>;
};
