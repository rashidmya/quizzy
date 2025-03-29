// sections/dashboard/quiz/view/utils/question-utils.tsx
import { 
  CheckSquare, 
  FileText, 
  FileQuestion, 
  AlignLeft,
  LucideIcon
} from "lucide-react";

/**
 * Gets icon and display label for a question type
 * @param type The question type
 * @returns Object with icon component and display label
 */
export function getQuestionTypeInfo(type: string): { icon: LucideIcon | null; label: string } {
  // Format question type for display
  const label = type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Get the appropriate icon for the question type
  let icon: LucideIcon | null = null;
  
  switch (type) {
    case "multiple_choice": 
      icon = CheckSquare;
      break;
    case "true_false":
      icon = FileText;
      break;
    case "fill_in_blank":
      icon = FileQuestion;
      break;
    case "open_ended":
      icon = AlignLeft;
      break;
    default:
      icon = null;
  }

  return { icon, label };
}