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
import { Choice, Question, QuizAttempt, QuizWithQuestions } from "@/types/quiz";
// actions
import {
  startQuizAttempt,
  submitQuizAttempt,
  autoSaveAnswer,
  getAttemptAnswers,
} from "@/actions/quiz/quiz-taking";
// icons
import { Loader2 } from "lucide-react";
// components
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// hooks
import { useActionState } from "@/hooks/use-action-state";
import QuizTakingState from "./quiz-taking-state";

type QuizTakingProps = {
  quiz: QuizWithQuestions;
};

export default function QuizTaking({ quiz }: QuizTakingProps) {
  const { data: session, status } = useSession();

  const { setTheme } = useTheme();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  const [displayOrder, setDisplayOrder] = useState<number[]>([]);

  const [initialAnswers, setInitialAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);

  const [quizTaken, setQuizTaken] = useState(false);

  const formRef = useRef<QuizTakingFormRef>(null);

  const [_, autoSaveAction, isAutoSavePending] = useActionState(
    autoSaveAnswer,
    {
      message: "",
    }
  );

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
      if (session && session.user?.email && !attempt) {
        const result = await startQuizAttempt({
          email: session.user.email,
          quizId: quiz.id,
        });

        if (result.error) {
          if (result.message === "Quiz already submitted") {
            setQuizTaken(true);
          }
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

        if (quiz.shuffleQuestions) {
          // Create an array of indices and shuffle it
          const indices = Array.from(
            { length: quiz.questions.length },
            (_, i) => i
          );
          setDisplayOrder(shuffleArray(indices));
        } else {
          // Use sequential order
          setDisplayOrder(
            Array.from({ length: quiz.questions.length }, (_, i) => i)
          );
        }
      }
    };

    fetchAttemptAnswers();
  }, [attempt, quizTaken, quiz.questions, quiz.shuffleQuestions]);

  /**
   * Final quiz submission.
   */
  const handleQuizSubmit = useCallback(async () => {
    // console.log(formRef.current?.getValues())
    if (!attempt) {
      toast.error("Something went wrong submitting your quiz!");
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

      // Process only the answers that changed
      for (const [questionId, answer] of Object.entries(data.answers)) {
        if (!questionId.trim() || !answer.trim()) continue;

        const result = await autoSaveAction({
          attemptId: attempt.id,
          questionId,
          answer,
        });

        if (result.error) {
          toast.error(result.message);
        }
      }
    },
    [attempt, autoSaveAction]
  );

  /**
   * Submits the quiz if time is up.
   */
  const handleTimeUp = useCallback(async () => {
    if (formRef.current) {
      await handleQuizSubmit();
    }
  }, [formRef, handleQuizSubmit]);

  // Order question based on if shuffle is on
  const orderedQuestions = displayOrder.map((index) => quiz.questions[index]);

  /**
   * Decide which content to display based on quiz state.
   */
  const renderContent = () => {
    // Loading state
    if (status === "loading") {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin" />
        </div>
      );
    }

    // Not logged in
    if (!session) {
      return <QuizTakingLogin quizId={quiz.id} />;
    }

    // Quiz already taken
    if (quizTaken) {
      return <QuizTakingState text="You have already completed this quiz." />;
    }

    // Loading attempt
    if (!attempt) {
      return <QuizTakingState text="Loading attempt..." />;
    }

    // Loading saved answers
    if (initialAnswers === undefined) {
      return <QuizTakingState text="Loading your saved answers..." />;
    }

    // Time is up
    if (!canContinueQuiz()) {
      // If attempt is null/undefined, maybe wait or show a message
      if (!attempt) {
        return (
          <QuizTakingState text="Could not retrieve your attempt. Please refresh the page." />
        );
      }

      // Otherwise, attempt is valid, so schedule the submission
      setTimeout(handleTimeUp, 0);

      return <QuizTakingState text="Time's up! Quiz has been submitted" />;
    }

    // Quiz in progress - the main form
    return (
      <>
        <Card className="fixed z-50 w-full border border-input mb-4 transition-colors duration-300 p-0 rounded-none shadow-none min-h-[75px]">
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
            quiz={{
              ...quiz,
              questions: orderedQuestions,
            }}
            onSubmit={async () => {
              await handleQuizSubmit();
              setQuizTaken(true);
            }}
            onAutoSave={handleAutoSave}
            isAutoSavePending={isAutoSavePending}
            initialAnswers={initialAnswers}
          />
        </div>
      </>
    );
  };

  return <div className="container mx-auto max-w-full">{renderContent()}</div>;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
