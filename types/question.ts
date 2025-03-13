// src/types/question.ts
export type QuestionType = "open_ended" | "multiple_choice";

export const QUESTION_TYPES: QuestionType[] = ["open_ended", "multiple_choice"];

// Optional: A helper function to get a display label for a question type.
export function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case "open_ended":
      return "Open Ended";
    case "multiple_choice":
      return "Multiple Choice";
    default:
      return "";
  }
}