// sections/(quiz)/quiz-taking/components/form-nav-buttons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface FormNavButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  isSubmitting: boolean;
  allAnswered: boolean;
  answeredCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Navigation buttons for quiz form
 * Handles previous/next navigation and final submission
 */
export default function FormNavButtons({
  currentIndex,
  totalQuestions,
  isSubmitting,
  allAnswered,
  answeredCount,
  onPrevious,
  onNext,
}: FormNavButtonsProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="sticky bottom-4 pt-4 bg-background/95 backdrop-blur-md border-t">
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0 || isSubmitting}
          className="w-1/3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            type="submit"
            className="w-1/3"
            disabled={!allAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {allAnswered
                  ? "Submit Quiz"
                  : `${totalQuestions - answeredCount} unanswered`}
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="w-1/3"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {!allAnswered && isLastQuestion && (
        <div className="mt-2 flex items-center justify-center">
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please answer all questions before submitting
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
