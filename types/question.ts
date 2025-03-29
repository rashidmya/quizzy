import { questions } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Question = InferSelectModel<typeof questions>;

// Define a union for all allowed question types.
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "open_ended";

// Base question with common fields.
export interface BaseQuestion extends Question {}

// Extend for multiple-choice questions.
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  // Replace with your detailed type if available.
  choices: {
    id?: string;
    text: string;
    isCorrect: boolean;
  }[];
}

// Extend for true/false questions.
export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  explanation?: string;
}

// Extend for fill-in-the-blank questions.
export interface FillInBlankQuestion extends BaseQuestion {
  type: "fill_in_blank";
  correctAnswer: string;
  acceptedAnswers?: string[]; // Optionally, list alternative correct answers.
}

// Extend for short answer (essay) questions.
export interface OpenEndedQuestion extends BaseQuestion {
  type: "open_ended";
  correctAnswer: string;
  acceptedAnswers?: string[];
}

// Create a union of all question types.
export type QuestionUnion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | OpenEndedQuestion;
