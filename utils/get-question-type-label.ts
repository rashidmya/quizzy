import { QuestionType } from "@/types/question";

export function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice";
    case "true_false":
      return "True/False";
    case "fill_in_blank":
      return "Fill in the Blank";
    case "short_answer":
      return "Short Answer";
    default:
      return "";
  }
}