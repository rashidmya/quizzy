// utils/get-question-type-utils.ts
import { QuestionType } from "@/types/question";

/**
 * Returns a human-readable label for a question type
 */
export function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice";
    case "true_false":
      return "True/False";
    case "fill_in_blank":
      return "Fill in the Blank";
    case "open_ended":
      return "Open Ended";
    default:
      return type;
  }
}

/**
 * Returns a color for each question type
 */
export function getQuestionTypeColor(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "text-blue-500";
    case "true_false":
      return "text-green-500";
    case "fill_in_blank":
      return "text-purple-500";
    case "open_ended":
      return "text-amber-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Returns corresponding icon name for a question type
 */
export function getQuestionTypeIcon(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "CheckCircle";
    case "true_false":
      return "Check";
    case "fill_in_blank":
      return "Text";
    case "open_ended":
      return "HelpCircle";
    default:
      return "Circle";
  }
}

/**
 * Returns background color class for a question type
 */
export function getQuestionTypeBackground(type: QuestionType): string {
  switch (type) {
    case "multiple_choice":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "true_false":
      return "bg-green-50 dark:bg-green-900/20";
    case "fill_in_blank":
      return "bg-purple-50 dark:bg-purple-900/20";
    case "open_ended":
      return "bg-amber-50 dark:bg-amber-900/20";
    default:
      return "bg-gray-50 dark:bg-gray-900/20";
  }
}