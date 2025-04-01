// sections/(quiz)/quiz-taking/components/quiz-taking-state.tsx
"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface QuizTakingStateProps {
  text?: string;
  secondaryText?: string;
  action?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Show quiz state messages with consistent styling
 * Used for loading states, completion messages, and error states
 */
export default function QuizTakingState({
  text,
  secondaryText,
  action,
  isLoading = false,
}: QuizTakingStateProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-md border animate-in fade-in-50 duration-300">
        <CardContent className="pt-6 pb-4 text-center">
          {isLoading && (
            <div className="mb-4">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            </div>
          )}

          {text && <h3 className="text-xl font-medium mb-2">{text}</h3>}

          {secondaryText && (
            <p className="text-muted-foreground text-sm">{secondaryText}</p>
          )}
        </CardContent>

        {action && (
          <CardFooter className="flex justify-center pb-6">{action}</CardFooter>
        )}
      </Card>
    </div>
  );
}
