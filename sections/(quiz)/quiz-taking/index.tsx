"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
// next-themes
import { useTheme } from "next-themes";
// next-auth
import { useSession } from "next-auth/react";
// sonner
import { toast } from "sonner";
// sections
import QuizTakingLogin from "./quiz-taking-login";
import QuizTakingTimer from "./quiz-taking-timer";
import QuizTakingForm, {
  QuizTakingFormValues,
  QuizTakingFormRef,
} from "./quiz-taking-form";
// types
import { QuizAttempt, QuizWithQuestions } from "@/types/quiz";
// actions
import {
  startQuizAttempt,
  submitQuizAttempt,
  autoSaveAnswer,
  getAttemptAnswers,
} from "@/actions/quiz/quiz-taking";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type QuizTakingProps = {
  quiz: QuizWithQuestions;
};

export default function QuizTaking({ quiz }: QuizTakingProps) {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [quizTaken, setQuizTaken] = useState(false);

  const formRef = useRef<QuizTakingFormRef>(null);

  /**
   * Force light theme for quiz-taking.
   */
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  /**
   * Checks if the user can still continue the quiz (time left or no timer).
   */
  const canContinueQuiz = useCallback(() => {
    if (quiz.timerMode === "none") return true;
    if (quiz.timerMode === "global" && attempt && quiz.timer) {
      const totalTime = quiz.timer; // in seconds
      const startedTime = new Date(attempt.startedAt).getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startedTime) / 1000);
      return totalTime - secondsPassed > 0;
    }
    return false;
  }, [quiz.timerMode, quiz.timer, attempt]);

  /**
   * Check quiz attempt status on initial load
   */
  useEffect(() => {
    const fetchQuizAttempt = async () => {
      if (session?.isQuiz && session.user?.email && !attempt) {
        const result = await startQuizAttempt({
          email: session.user.email,
          quizId: quiz.id,
        });

        if (result.error) {
          if (result.message === "Quiz already submitted") {
            setQuizTaken(true);
          }
          toast.error(result.message);
          return;
        }

        if (result.attempt) {
          // Check if quiz already submitted
          if (result.attempt.submitted) {
            return setQuizTaken(true);
          }

          setAttempt({
            ...result.attempt,
          });
        }
      }
    };

    fetchQuizAttempt();
  }, [session, attempt, quiz.id, quiz.timerMode, quiz.timer]);

  /**
   * Fetch previously saved answers for the current attempt.
   */
  useEffect(() => {
    const fetchAttemptAnswers = async () => {
      if (attempt && !quizTaken) {
        const result = await getAttemptAnswers({ attemptId: attempt.id });

        if (result.error) {
          toast.error(result.message);
          return;
        }

        const answersRecord: Record<string, string> = {};
        result.answers?.forEach(({ questionId, answer }) => {
          answersRecord[questionId] = answer;
        });

        // Ensure every question is represented
        quiz.questions.forEach(({ id }) => {
          if (!answersRecord[id]) answersRecord[id] = "";
        });

        setInitialAnswers(answersRecord);
      }
    };

    fetchAttemptAnswers();
  }, [attempt, quizTaken, quiz.questions]);

  /**
   * Final quiz submission.
   */
  const handleQuizSubmit = useCallback(async () => {
    // console.log(formRef.current?.getValues())
    if (!attempt) {
      toast.error("attempt undefined");
      return;
    }

    const submitResult = await submitQuizAttempt({ attemptId: attempt.id });
    if (submitResult.error) {
      toast.error(submitResult.message);
      return;
    }

    toast.success(submitResult.message);
  }, [session, attempt]);

  /**
   * Auto-save each answer whenever the user changes it.
   */
  const handleAutoSave = useCallback(
    async (data: QuizTakingFormValues) => {
      if (!attempt) return;

      for (const [questionId, answer] of Object.entries(data.answers)) {
        if (!questionId.trim()) continue;

        const result = await autoSaveAnswer({
          attemptId: attempt.id,
          questionId,
          answer,
        });

        if (result.error) {
          toast.error(result.message);
        }
      }
    },
    [attempt]
  );

  /**
   * Submits the quiz if time is up.
   */
  const handleTimeUp = useCallback(async () => {
    if (formRef.current) {
      await handleQuizSubmit();
    }
  }, [formRef, handleQuizSubmit]);

  /**
   * Decide which content to display based on quiz state.
   */
  const renderContent = () => {
    // Loading state
    if (status === "loading") {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading quiz...</p>
        </div>
      );
    }

    // Not logged in
    if (!session?.isQuiz) {
      return <QuizTakingLogin quizId={quiz.id} />;
    }

    // Quiz already taken
    if (quizTaken) {
      return (
        <Alert variant="default" className="max-w-3xl mx-auto">
          <AlertDescription className="text-lg font-medium">
            You have already completed this quiz.
          </AlertDescription>
        </Alert>
      );
    }

    // Loading attempt
    if (!attempt) {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Loading saved answers
    if (initialAnswers === undefined) {
      return (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading your saved answers...
            </p>
          </CardContent>
        </Card>
      );
    }

    // Time is up
    if (!canContinueQuiz()) {
      // If attempt is null/undefined, maybe wait or show a message
      if (!attempt) {
        return (
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertDescription>
              Could not retrieve your attempt. Please refresh the page.
            </AlertDescription>
          </Alert>
        );
      }

      // Otherwise, attempt is valid, so schedule the submission
      setTimeout(handleTimeUp, 0);

      return (
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertDescription className="flex items-center justify-center text-lg font-medium">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Time's up! Submitting your quiz...
          </AlertDescription>
        </Alert>
      );
    }

    // Quiz in progress - the main form
    return (
      <>
        <Card className="fixed z-50 w-full border border-input mb-4 transition-colors duration-300 p-0 rounded-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl transition-colors duration-300">
              {quiz.title}
            </CardTitle>
            {quiz.timerMode === "global" && (
              <QuizTakingTimer
                attempt={attempt}
                totalTime={quiz.timer}
                timerMode={quiz.timerMode}
                onTimeUp={handleTimeUp}
              />
            )}
          </CardHeader>
        </Card>

        <div className="pt-34">
          <QuizTakingForm
            ref={formRef}
            quiz={quiz}
            onSubmit={async () => {
              await handleQuizSubmit();
              setQuizTaken(true);
            }}
            onAutoSave={handleAutoSave}
            initialAnswers={initialAnswers}
          />
        </div>
      </>
    );
  };

  return <div className="container mx-auto max-w-full">{renderContent()}</div>;
}
