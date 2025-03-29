// sections/dashboard/quiz/view/components/fill-in-blank-question.tsx
import { FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Props for the FillInBlankQuestion component
 */
interface FillInBlankQuestionProps {
  correctAnswer: string;
  acceptedAnswers?: string[];
}

/**
 * Displays a fill-in-the-blank question's answers
 */
export default function FillInBlankQuestion({
  correctAnswer,
  acceptedAnswers,
}: FillInBlankQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <FileQuestion className="h-4 w-4" />
        Correct Answer
      </h4>
      <div className="p-3 rounded-md border bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800">
        <span className="font-medium">{correctAnswer}</span>
      </div>

      {acceptedAnswers && acceptedAnswers.length > 0 && (
        <div className="mt-3">
          <h5 className="text-sm font-medium mb-2">Also accepted:</h5>
          <div className="flex flex-wrap gap-2">
            {acceptedAnswers}
          </div>
        </div>
      )}
    </div>
  );
}
