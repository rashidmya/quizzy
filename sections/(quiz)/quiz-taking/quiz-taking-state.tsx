"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuizTakingStateProps {
  text?: string;
  secondaryText?: string;
  action?: React.ReactNode;
}

/**
 * Show quiz state
 */
export default function QuizTakingState({
  text,
  secondaryText,
  action,
}: QuizTakingStateProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 text-center">
      <Alert variant="default" className="max-w-3xl mx-auto border-0">
        {text && (
          <AlertDescription className="flex flex-col items-center justify-center text-lg font-medium text-center">
            {text}
          </AlertDescription>
        )}
        {secondaryText && (
          <AlertDescription className="flex flex-col items-center justify-center text-sm font-medium text-center">
            {secondaryText}
          </AlertDescription>
        )}
        {action && action}
      </Alert>
    </div>
  );
}
