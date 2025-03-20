"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import QuizTakingFormLogin from "./quiz-taking-login";
import QuizTakingFormTimer from "./quiz-taking-timer";
import QuizTakingFormMain, {
  QuizTakingFormValues,
  QuizTakingFormRef,
} from "./quiz-taking-form";
import { QuizWithQuestions } from "@/types/quiz";
import {
  startQuizAttempt,
  submitQuizAttempt,
  autoSaveAnswer,
} from "@/actions/quiz";

export type QuizAttempt = {
  id: string;
  email: string;
  quizId: string;
  startedAt: string; // ISO timestamp from the server
};

type QuizTakingFormProps = {
  quiz: QuizWithQuestions & {
    timer: number;
    timerMode: "global" | "none";
    id: string;
  };
};

export default function QuizTaking({ quiz }: QuizTakingFormProps) {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quizTaken, setQuizTaken] = useState(false);

  const formRef = useRef<QuizTakingFormRef>(null);

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  // Determine if the quiz can be continued.
  const canContinueQuiz = () => {
    if (quiz.timerMode === "none") return true;
    if (quiz.timerMode === "global" && attempt) {
      const totalTime = quiz.timer; // assume in seconds
      const startedTime = new Date(attempt.startedAt).getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startedTime) / 1000);
      return totalTime - secondsPassed > 0;
    }
    return false;
  };

  // Fetch the quiz attempt.
  useEffect(() => {
    if (session && session.isQuiz && session.user?.email && !attempt) {
      (async () => {
        const result = await startQuizAttempt({
          email: session.user.email,
          quizId: quiz.id,
        });
        if (result.error) {
          toast.error(result.message);
          if (result.message === "Quiz already submitted") {
            setQuizTaken(true);
          }
        } else if (result.attempt) {
          const normalizedAttempt: QuizAttempt = {
            id: result.attempt.id,
            email: result.attempt.email,
            quizId: result.attempt.quizId!,
            startedAt:
              result.attempt.startedAt instanceof Date
                ? result.attempt.startedAt.toISOString()
                : result.attempt.startedAt,
          };
          setAttempt(normalizedAttempt);
        }
      })();
    }
  }, [session, attempt, quiz.id, startQuizAttempt]);

  const handleTimeUp = async () => {
    if (formRef.current) {
      const formData = formRef.current.getValues();
      await handleAutoSave(formData);
      await handleQuizSubmit();
    }
  };

  const handleQuizSubmit = async () => {
    if (!session || !attempt) {
      toast.error("Please log in and start the quiz before submitting.");
      return;
    }
    const submitResult = await submitQuizAttempt({ attemptId: attempt.id });
    if (submitResult.error) {
      toast.error(submitResult.message);
    } else {
      toast.success(submitResult.message);
      setQuizTaken(true);
    }
  };

  // Auto-save callback.
  const handleAutoSave = async (data: QuizTakingFormValues) => {
    if (!attempt) return;
    for (const answerObj of data.answers) {
      await autoSaveAnswer({
        attemptId: attempt.id,
        questionId: answerObj.questionId,
        answer: answerObj.answer,
      });
    }
  };

  let content: JSX.Element;

  if (status === "loading") {
    content = <div>Loading...</div>;
  } else if (!session || !session.isQuiz) {
    content = <QuizTakingFormLogin quizId={quiz.id} />;
  } else if (!attempt && !quizTaken) {
    content = <div>Loading quiz attempt...</div>;
  } else if (!canContinueQuiz()) {
    // If time is up, trigger auto submission.
    // To avoid multiple auto-submit calls, you might disable further submissions.
    handleTimeUp();
    content = (
      <div className="max-w-3xl w-3xl m-auto p-4">
        <p className="text-xl font-semibold">
          Time's up! Submitting your quiz...
        </p>
      </div>
    );
  } else if (quizTaken) {
    content = (
      <div className="max-w-3xl w-3xl m-auto p-4">
        <p className="text-xl font-semibold">
          You have already taken this quiz.
        </p>
      </div>
    );
  } else {
    content = (
      <>
        <nav className="flex justify-between items-center p-4 bg-gray-100 mb-4">
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          {quiz.timerMode === "global" && attempt && (
            <QuizTakingFormTimer
              attempt={attempt}
              totalTime={quiz.timer}
              timerMode={quiz.timerMode}
              onTimeUp={handleTimeUp}
            />
          )}
        </nav>
        <QuizTakingFormMain
          ref={formRef}
          quiz={quiz}
          onSubmit={handleQuizSubmit}
          onAutoSave={handleAutoSave}
        />
      </>
    );
  }

  return <div>{content}</div>;
}
