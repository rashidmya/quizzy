import { Choice, Question, Quiz } from "@/lib/queries/quizzes";


export type QuizWithQuestions = Quiz & {
  questions: Array<Question & { choices: Choice[] }>;
};
