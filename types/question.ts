import { questions } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Question = InferSelectModel<typeof questions>;

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "short_answer";

// Base question properties that all question types will share
export interface BaseQuestionProperties {
  // Common properties if needed
}

// Multiple choice specific properties
export interface MultipleChoiceProperties extends BaseQuestionProperties {
  choices: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
  }>;
}

// True/False specific properties
export interface TrueFalseProperties extends BaseQuestionProperties {
  correctAnswer: boolean;
}

// Fill in the blank specific properties
export interface FillInBlankProperties extends BaseQuestionProperties {
  blanks: Array<{
    id: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
  }>;
}

// Short answer specific properties
export interface ShortAnswerProperties extends BaseQuestionProperties {
  sampleAnswer?: string;
  maxLength?: number;
  minLength?: number;
  rubric?: Array<{
    criteria: string;
    maxPoints: number;
  }>;
}

// Union type for all possible question properties
export type QuestionProperties =
  | MultipleChoiceProperties
  | TrueFalseProperties
  | FillInBlankProperties
  | ShortAnswerProperties;
