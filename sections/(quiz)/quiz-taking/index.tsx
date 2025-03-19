"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import QuizTakingFormLogin from "./quiz-taking-login";
import QuizTakingFormTimer from "./quiz-taking-timer";
import QuizTakingFormMain, {
  QuizTakingFormValues,
} from "./quiz-taking-form";
import { QuizWithQuestions } from "@/types/quiz";

type QuizAttempt = {
  id: string;
  email: string;
  quizId: string;
  startedAt: string; // ISO timestamp from the server
};

type QuizTakingFormProps = {
  quiz: QuizWithQuestions;
};

export default function QuizTaking({ quiz }: QuizTakingFormProps) {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quizTaken, setQuizTaken] = useState(false);

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  // Function to start a quiz attempt on the server.
  const startQuizAttempt = async (
    email: string
  ): Promise<QuizAttempt | null> => {
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, quizId: quiz.id }),
      });
      if (!res.ok) throw new Error("Failed to start quiz attempt");
      const data = await res.json();
      return data.attempt as QuizAttempt;
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      return null;
    }
  };

  // Once a valid session exists, fetch the quiz attempt if not already set.
  useEffect(() => {
    if (session && session.isQuiz && session.user?.email && !attempt) {
      (async () => {
        const attemptData = await startQuizAttempt(
          session.user.email as string
        );
        if (attemptData) {
          setAttempt(attemptData);
        } else {
          toast.error("Unable to start quiz. It may have already been taken.");
          setQuizTaken(true);
        }
      })();
    }
  }, [session, attempt, quiz.id]);

  const handleQuizSubmit = async (data: QuizTakingFormValues) => {
    if (!session || !attempt) {
      toast.error("Please log in and start the quiz before submitting.");
      return;
    }
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          quizId: quiz.id,
          attemptId: attempt.id,
          answers: data.answers,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast.success("Quiz submitted successfully!");
      setQuizTaken(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  // Determine what to render.
  let content: JSX.Element;

  if (status === "loading") {
    content = <div>Loading...</div>;
  } else if (!session || !session.isQuiz) {
    // Show inline login form if no valid quiz session.
    content = <QuizTakingFormLogin quizId={quiz.id} />;
  } else if (!attempt) {
    content = <div>Loading quiz attempt...</div>;
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
          <QuizTakingFormTimer attempt={attempt} totalTime={quiz.timer} />
        </nav>
        <QuizTakingFormMain quiz={quiz} onSubmit={handleQuizSubmit} />
      </>
    );
  }

  return <div>{content}</div>;
}
