import {
  multipleChoiceDetails,
  questions,
  fillInBlankDetails,
  openEndedDetails,
  trueFalseDetails,
} from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Question = InferSelectModel<typeof questions>;

export type MultipleChoice = InferSelectModel<typeof multipleChoiceDetails>;

export type FillInBlank = InferSelectModel<typeof fillInBlankDetails>;

export type OpenEnded = InferSelectModel<typeof openEndedDetails>;

export type TrueFalse = InferSelectModel<typeof trueFalseDetails>;

// Define a union for all allowed question types.
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "open_ended";

// Extend for multiple-choice questions.
export interface MultipleChoiceQuestion extends Question {
  type: "multiple_choice";
  // Replace with your detailed type if available.
  choices: {
    id?: string;
    text: string;
    isCorrect: boolean;
  }[];
}

// Extend for true/false questions.
export interface TrueFalseQuestion extends Question {
  type: "true_false";
  explanation?: string;
  correctAnswer: boolean;
}

// Extend for fill-in-the-blank questions.
export interface FillInBlankQuestion extends Question {
  type: "fill_in_blank";
  correctAnswer: string;
  acceptedAnswers?: string; // Optionally, list alternative correct answers.
}

// Extend for open ended questions.
export interface OpenEndedQuestion extends Question {
  type: "open_ended";
  guidelines?: string;
}

// Create a union of all question types.
export type QuestionUnion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | OpenEndedQuestion;