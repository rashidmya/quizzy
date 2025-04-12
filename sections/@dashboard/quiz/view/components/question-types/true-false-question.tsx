// sections/dashboard/quiz/view/components/true-false-question.tsx
import { Check, FileText } from "lucide-react";

/**
 * Props for the TrueFalseQuestion component
 */
interface TrueFalseQuestionProps {
  correctAnswer: boolean;
  explanation?: string;
}

/**
 * Displays a true/false question's answer
 */
export default function TrueFalseQuestion({
  correctAnswer,
  explanation,
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Correct Answer
      </h4>
      <div className="flex gap-4">
        <div
          className={`flex items-center gap-2 p-3 rounded-md border ${
            correctAnswer
              ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800"
              : "bg-muted/20"
          }`}
        >
          <span className="font-medium">True</span>
          {correctAnswer && <Check className="h-4 w-4 text-green-600 ml-2" />}
        </div>

        <div
          className={`flex items-center gap-2 p-3 rounded-md border ${
            !correctAnswer
              ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800"
              : "bg-muted/20"
          }`}
        >
          <span className="font-medium">False</span>
          {!correctAnswer && <Check className="h-4 w-4 text-green-600 ml-2" />}
        </div>
      </div>

      {explanation && (
        <div className="mt-3 p-3 bg-muted/30 rounded-md">
          <h5 className="text-sm font-medium">Explanation:</h5>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
}
