// sections/dashboard/quiz/view/components/multiple-choice-question.tsx
import { Check, X, CheckSquare } from "lucide-react";

/**
 * Props for the MultipleChoiceQuestion component
 */
interface MultipleChoiceQuestionProps {
  choices: {
    id?: string;
    text: string;
    isCorrect: boolean;
  }[];
}

/**
 * Displays a multiple choice question's answer options
 */
export default function MultipleChoiceQuestion({ choices }: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        Answer Choices
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {choices.map((choice, choiceIndex) => (
          <div 
            key={choice.id || choiceIndex} 
            className={`flex items-center gap-2 p-3 rounded-md border ${
              choice.isCorrect 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' 
                : 'bg-muted/20'
            }`}
          >
            {choice.isCorrect ? (
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span>{choice.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}