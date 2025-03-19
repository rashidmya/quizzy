import { QuestionType } from "@/types/quiz";

export function getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      default:
        return "";
    }
  }
  