// sections/(quiz)/quiz-taking/quiz-taking-container.tsx
"use client";

import { useState, useCallback } from "react";
// next-auth
import { useSession } from "next-auth/react";
// components
import QuizTakingContent from "./quiz-taking-content";
import QuizTakingLogin from "./components/quiz-taking-login";
import QuizTakingState from "./components/quiz-taking-state";
import LoadingState from "./components/loading-state";
// types
import { QuizWithQuestions } from "@/types/quiz";

interface QuizTakingContainerProps {
  quiz: QuizWithQuestions;
}

/**
 * Main container for the quiz-taking experience
 * Handles authentication and high-level quiz state
 */
export default function QuizTakingContainer({
  quiz,
}: QuizTakingContainerProps) {
  // Session and authentication management
  const { data: session, status } = useSession();
  const [quizTaken, setQuizTaken] = useState(false);

  /**
   * Retry the quiz by refreshing the page
   */
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = useCallback(() => {
    setQuizTaken(true);
  }, []);

  /**
   * Decide which content to display based on quiz state
   */
  if (status === "loading") {
    return <LoadingState />;
  }

  // Not logged in
  if (status === "unauthenticated" || !session || !session.user || !session.user.email) {
    return <QuizTakingLogin quizId={quiz.id} />;
  }

  // Quiz already taken
  if (quizTaken) {
    return (
      <QuizTakingState
        text="You've completed this quiz!"
        secondaryText="Thank you for your participation."
        action={
          <button
            className="mt-4 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
            onClick={handleRetry}
          >
            Take Again
          </button>
        }
      />
    );
  }

  // Quiz in progress
  return (
    <QuizTakingContent
      quiz={quiz}
      userEmail={session.user.email}
      onQuizComplete={handleQuizComplete}
    />
  );
}
