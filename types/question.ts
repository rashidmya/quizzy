// src/types/question.ts
export type QuestionType = "multiple_choice";

export const QUESTION_TYPES = ["multiple_choice"] as const;

// Optional: A helper function to get a display label for a question type.
export function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice";
    default:
      return "";
  }
}
