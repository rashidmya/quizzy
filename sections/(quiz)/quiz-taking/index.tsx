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
import { QuizWithQuestions } from "@/types/quiz";
// actions
import {
  startQuizAttempt,
  submitQuizAttempt,
  autoSaveAnswer,
  getAttemptAnswers,
} from "@/actions/quiz/quiz-taking";

export type QuizAttempt = {
  id: string;
  email: string;
  quizId: string;
  startedAt: string; // ISO timestamp from the server
};

type QuizTakingProps = {
  quiz: QuizWithQuestions & {
    timer: number;
    timerMode: "global" | "none";
    id: string;
  };
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
    if (quiz.timerMode === "global" && attempt) {
      const totalTime = quiz.timer; // in seconds
      const startedTime = new Date(attempt.startedAt).getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startedTime) / 1000);
      return totalTime - secondsPassed > 0;
    }
    return false;
  }, [quiz.timerMode, quiz.timer, attempt]);

  /**
   * Initialize the quiz attempt once the user is verified.
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
          const startedAt =
            result.attempt.startedAt instanceof Date
              ? result.attempt.startedAt.toISOString()
              : result.attempt.startedAt;

          setAttempt({
            id: result.attempt.id,
            email: result.attempt.email,
            quizId: result.attempt.quizId ?? "",
            startedAt,
          });
        }
      }
    };

    fetchQuizAttempt();
  }, [session, attempt, quiz.id]);

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
   * Submits the quiz if time is up.
   */
  const handleTimeUp = useCallback(async () => {
    if (formRef.current) {
      await handleQuizSubmit();
    }
  }, []);

  /**
   * Final quiz submission.
   */
  const handleQuizSubmit = useCallback(async () => {
    if (!session?.isQuiz || !attempt) {
      toast.error("Please log in and start the quiz before submitting.");
      return;
    }

    const submitResult = await submitQuizAttempt({ attemptId: attempt.id });
    if (submitResult.error) {
      toast.error(submitResult.message);
      return;
    }

    toast.success(submitResult.message);
    setQuizTaken(true);
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
   * Decide which content to display based on quiz state.
   */
  let content: JSX.Element;

  if (status === "loading") {
    content = <div>Loading...</div>;
  } else if (!session?.isQuiz) {
    content = <QuizTakingLogin quizId={quiz.id} />;
  } else if (quizTaken) {
    content = (
      <div className="max-w-3xl w-3xl m-auto p-4">
        <p className="text-xl font-semibold">
          You have already taken this quiz.
        </p>
      </div>
    );
  } else if (!attempt) {
    content = <div>Loading quiz attempt...</div>;
  } else if (initialAnswers === undefined) {
    content = <div>Loading saved answers...</div>;
  } else if (!canContinueQuiz()) {
    // Time is up
    handleTimeUp();
    content = (
      <div className="max-w-3xl w-3xl m-auto p-4">
        <p className="text-xl font-semibold">
          Time's up! Submitting your quiz...
        </p>
      </div>
    );
  } else {
    // Quiz in progress
    content = (
      <>
        <nav className="flex justify-between items-center p-4 bg-gray-100 mb-4">
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          {quiz.timerMode === "global" && (
            <QuizTakingTimer
              attempt={attempt}
              totalTime={quiz.timer}
              timerMode={quiz.timerMode}
              onTimeUp={handleTimeUp}
            />
          )}
        </nav>
        <QuizTakingForm
          ref={formRef}
          quiz={quiz}
          onSubmit={handleQuizSubmit}
          onAutoSave={handleAutoSave}
          initialAnswers={initialAnswers}
        />
      </>
    );
  }

  return <div>{content}</div>;
}
