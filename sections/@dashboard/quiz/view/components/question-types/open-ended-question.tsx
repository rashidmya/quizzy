// sections/dashboard/quiz/view/components/open-ended-question.tsx
import { AlignLeft } from "lucide-react";

/**
 * Props for the OpenEndedQuestion component
 */
interface OpenEndedQuestionProps {
  guidelines?: string;
}

/**
 * Displays an open-ended question's guidelines
 */
export default function OpenEndedQuestion({
  guidelines,
}: OpenEndedQuestionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <AlignLeft className="h-4 w-4" />
        Open-Ended Question
      </h4>

      {guidelines ? (
        <div className="p-3 bg-muted/30 rounded-md">
          <h5 className="text-sm font-medium">Response Guidelines:</h5>
          <p className="text-sm mt-1">{guidelines}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This is an open-ended question with no specific response guidelines.
        </p>
      )}
    </div>
  );
}
