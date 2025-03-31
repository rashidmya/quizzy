// sections/(quiz)/quiz-taking/quiz-taking-content.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
// sonner
import { toast } from "sonner";
// components
import QuizTakingForm, {
  QuizTakingFormRef,
  QuizTakingFormValues,
} from "./components/form/quiz-taking-form";
import QuizTakingState from "./components/quiz-taking-state";
import QuizHeader from "./components/quiz-header";
// types
import { QuizWithQuestions } from "@/types/quiz";
import { QuizAttempt } from "@/types/attempt";
import {
  startQuizAttempt,
  submitQuizAttempt,
  autoSaveAnswer,
  getAttemptAnswers,
  getQuestionDetails,
} from "@/actions/quiz/quiz-taking";
// hooks
import { useActionState } from "@/hooks/use-action-state";
import { useQuizTimer } from "./hooks/use-quiz-timer";
import { useQuestionOrder } from "./hooks/use-question-order";

interface QuizTakingContentProps {
  quiz: QuizWithQuestions;
  userEmail: string;
  onQuizComplete: () => void;
}

/**
 * Manages active quiz-taking content and state
 * Enhanced to support all question types
 */
export default function QuizTakingContent({
  quiz,
  userEmail,
  onQuizComplete,
}: QuizTakingContentProps) {
  // Quiz attempt and answer state
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [questionDetails, setQuestionDetails] = useState<Record<string, any>>(
    {}
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Form reference for submission and interaction
  const formRef = useRef<QuizTakingFormRef>(null);

  const isReady =
    attempt !== null && initialAnswers !== undefined && !isLoadingDetails;

  // Question order management (handles shuffling)
  const { displayOrder, orderedQuestions } = useQuestionOrder(
    quiz.questions,
    quiz.shuffleQuestions,
    isReady
  );

  // Auto-save action state
  const [_, autoSaveAction, isAutoSavePending] = useActionState(
    autoSaveAnswer,
    { message: "" }
  );

  // Timer management
  const { isTimeUp, canContinueQuiz, startTimer, handleTimeUp } = useQuizTimer(
    quiz.timerMode,
    quiz.timer,
    attempt?.startedAt,
    async () => {
      if (formRef.current) {
        const values = formRef.current.getValues();
        await handleQuizSubmit(values);
      }
    }
  );

  /**
   * Initialize or retrieve quiz attempt
   */
  useEffect(() => {
    const fetchQuizAttempt = async () => {
      if (!attempt) {
        const result = await startQuizAttempt({
          email: userEmail,
          quizId: quiz.id,
        });

        if (result.error) {
          if (result.message === "Quiz already submitted") {
            onQuizComplete();
          }
          return;
        }

        if (result.attempt) {
          // Check if quiz already submitted
          if (result.attempt.submitted) {
            return onQuizComplete();
          }

          setAttempt(result.attempt);
          startTimer(result.attempt.startedAt);
        }
      }
    };

    fetchQuizAttempt();
  }, [userEmail, quiz.id, attempt, startTimer, onQuizComplete]);

  /**
   * Fetch question-specific details
   */
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (quiz.questions.length > 0) {
        setIsLoadingDetails(true);

        try {
          // Fetch details for all questions in the quiz
          const questionIds = quiz.questions.map((q) => q.id);
          const details = await getQuestionDetails(questionIds);

          if (!details.error) {
            setQuestionDetails(details.data || {});
          } else {
            toast.error("Failed to load question details");
          }
        } catch (error) {
          console.error("Error fetching question details:", error);
          toast.error("Failed to load question details");
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchQuestionDetails();
  }, [quiz.questions]);

  /**
   * Fetch previously saved answers for the current attempt
   */
  useEffect(() => {
    const fetchAttemptAnswers = async () => {
      if (attempt) {
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
  }, [attempt, quiz.questions]);

  /**
   * Final quiz submission
   */
  const handleQuizSubmit = useCallback(
    async (data: QuizTakingFormValues) => {
      if (!attempt) {
        toast.error("Something went wrong submitting your quiz");
        return;
      }

      // First auto-save all answers one final time
      for (const [questionId, answer] of Object.entries(data.answers)) {
        if (!questionId.trim() || !answer.trim()) continue;

        await autoSaveAction({
          attemptId: attempt.id,
          questionId,
          answer,
        });
      }

      // Now submit the attempt
      const submitResult = await submitQuizAttempt({ attemptId: attempt.id });
      if (submitResult.error) {
        toast.error(submitResult.message);
        return;
      }

      onQuizComplete();
      toast.success(submitResult.message);
    },
    [attempt, autoSaveAction, onQuizComplete]
  );

  /**
   * Auto-save each answer whenever the user changes it
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
   * Enhance questions with type-specific details
   */
  const enhanceQuestionsWithDetails = useCallback(() => {
    if (!orderedQuestions || !questionDetails) return [];

    return orderedQuestions.map((question) => {
      const details = questionDetails[question.id] || {};

      // Combine the base question with type-specific details
      return {
        ...question,
        ...details,
      };
    });
  }, [orderedQuestions, questionDetails]);

  // Loading attempt
  if (!attempt) {
    return <QuizTakingState text="Preparing your quiz..." isLoading />;
  }

  // Loading saved answers
  if (initialAnswers === undefined) {
    return <QuizTakingState text="Loading your saved answers..." isLoading />;
  }

  // Loading question details
  if (isLoadingDetails) {
    return <QuizTakingState text="Loading question details..." isLoading />;
  }

  // Time is up
  if (!canContinueQuiz) {
    return (
      <QuizTakingState
        text="Time's up!"
        secondaryText="Your quiz has been automatically submitted."
      />
    );
  }

  // Get enhanced questions with their type-specific details
  const enhancedQuestions = enhanceQuestionsWithDetails();

  // Quiz in progress - the main form
  return (
    <>
      <QuizHeader
        title={quiz.title}
        timerMode={quiz.timerMode}
        timer={quiz.timer}
        startedAt={attempt.startedAt}
        onTimeUp={handleTimeUp}
      />

      <div className="pt-20 pb-20">
        <QuizTakingForm
          ref={formRef}
          quiz={{
            ...quiz,
            questions: enhancedQuestions,
          }}
          onSubmit={handleQuizSubmit}
          onAutoSave={handleAutoSave}
          isAutoSavePending={isAutoSavePending}
          initialAnswers={initialAnswers}
        />
      </div>
    </>
  );
}
