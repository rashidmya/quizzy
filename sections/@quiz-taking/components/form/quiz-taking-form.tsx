// sections/(quiz)/quiz-taking/components/form/quiz-taking-form.tsx
"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useRef,
  useEffect,
} from "react";
// react-hook-form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// components
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Clock, Save, Loader2 } from "lucide-react";
import QuestionNavigation from "./question-navigation";
import CurrentQuestion from "./current-question";
import FormNavButtons from "./form-nav-buttons";
// types
import { QuizWithQuestions } from "@/types/quiz";

/**
 * Form reference interface for parent component interaction
 */
export interface QuizTakingFormRef {
  getValues: () => QuizTakingFormValues;
  triggerSubmit: () => void;
}

/**
 * Form values interface for managed input data
 */
export type QuizTakingFormValues = {
  answers: Record<string, string>;
};

/**
 * Form validation schema
 */
const formSchema = z.object({
  answers: z.record(z.string()),
});

/**
 * Props for the quiz-taking form component
 */
interface QuizTakingFormProps {
  quiz: QuizWithQuestions;
  onSubmit: (data: QuizTakingFormValues) => Promise<void>;
  onAutoSave?: (data: QuizTakingFormValues) => Promise<void>;
  isAutoSavePending: boolean;
  initialAnswers?: Record<string, string>;
}

/**
 * Enhanced quiz form component that renders questions with pagination
 * Supports multiple question types
 */
const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers, isAutoSavePending }, ref) => {
    // Ensure quiz has questions array
    const hasQuestions =
      Array.isArray(quiz.questions) && quiz.questions.length > 0;

    // Current question index state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Set up form with validation
    const methods = useForm<QuizTakingFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        answers:
          initialAnswers ||
          (hasQuestions
            ? quiz.questions.reduce((acc, q) => {
                acc[q.id] = "";
                return acc;
              }, {} as Record<string, string>)
            : {}),
      },
      mode: "onChange",
    });

    const { control, handleSubmit, reset, getValues, formState } = methods;

    // Auto-save timer reference
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const previousAnswersRef = useRef<Record<string, string>>(
      initialAnswers || {}
    );

    // Clear auto-save timer on unmount
    useEffect(() => {
      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }, []);

    // Reset form when initialAnswers changes
    useEffect(() => {
      if (initialAnswers) {
        reset({ answers: initialAnswers });
        previousAnswersRef.current = { ...initialAnswers };
      }
    }, [initialAnswers, reset]);

    // Setup auto-save when form values change
    useEffect(() => {
      const setupAutoSave = async () => {
        if (!onAutoSave) return;

        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          const currentValues = getValues();
          const changedAnswers: Record<string, string> = {};

          // Find changed answers
          Object.entries(currentValues.answers).forEach(
            ([questionId, answer]) => {
              // Only save if there's an actual value and it's different from previous
              if (
                (answer || answer === "") &&
                previousAnswersRef.current[questionId] !== answer
              ) {
                changedAnswers[questionId] = answer;
              }
            }
          );

          // Auto-save if changes exist
          if (Object.keys(changedAnswers).length > 0) {
            previousAnswersRef.current = { ...currentValues.answers };
            onAutoSave({ answers: changedAnswers });
          }
        }, 800);
      };

      setupAutoSave();
    }, [formState.isDirty, getValues, onAutoSave]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getValues,
      triggerSubmit: () => handleSubmit(handleFormSubmit)(),
    }));

    // Handle form submission
    const handleFormSubmit = async (data: QuizTakingFormValues) => {
      try {
        setIsSubmitting(true);
        await onSubmit(data);
      } catch (error) {
        console.error("Error submitting quiz:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Check if questions are available
    if (!hasQuestions) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading quiz questions...</p>
        </div>
      );
    }

    // Get current question - with safety check
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) {
      // Reset to first question if current index is invalid
      setCurrentQuestionIndex(0);
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading question data...</p>
        </div>
      );
    }

    // Track quiz completion progress
    const answers = getValues("answers");
    const answeredCount = Object.values(answers).filter(
      (answer) => answer && answer.trim() !== ""
    ).length;
    const totalQuestions = quiz.questions.length;
    const completionPercentage = (answeredCount / totalQuestions) * 100;
    const allAnswered = answeredCount === totalQuestions;

    // Navigation functions
    const goToNextQuestion = () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        // Save current answer before moving
        const currAnswers = getValues().answers;
        previousAnswersRef.current = { ...currAnswers };
        
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      }
    };

    const goToPreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        // Save current answer before moving
        const currAnswers = getValues().answers;
        previousAnswersRef.current = { ...currAnswers };
        
        setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      }
    };

    const goToQuestion = (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        // Save current answer before moving
        const currAnswers = getValues().answers;
        previousAnswersRef.current = { ...currAnswers };
        
        setCurrentQuestionIndex(index);
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {answeredCount} of {totalQuestions} questions answered
            </span>
            <span className="text-sm font-medium">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Question navigation indicators */}
        <QuestionNavigation
          questions={quiz.questions}
          answers={answers}
          currentIndex={currentQuestionIndex}
          onSelectQuestion={goToQuestion}
        />

        {/* Auto-save indicator */}
        {onAutoSave && (
          <Alert
            variant="default"
            className={`mb-6 transition-colors duration-300 ${
              !isAutoSavePending
                ? "bg-muted/50"
                : "bg-amber-50 dark:bg-amber-900/20"
            }`}
          >
            {!isAutoSavePending ? (
              <Clock className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2 animate-pulse text-amber-500" />
            )}
            <AlertDescription>
              {!isAutoSavePending
                ? "Your answers are automatically saved as you progress"
                : "Saving your answer..."}
            </AlertDescription>
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Current question */}
            <CurrentQuestion
              key={currentQuestion.id} // This key is important for proper re-rendering
              question={currentQuestion}
              isAnswered={!!answers[currentQuestion.id]?.trim()}
              questionIndex={currentQuestionIndex}
            />

            {/* Navigation buttons */}
            <FormNavButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              isSubmitting={isSubmitting}
              allAnswered={allAnswered}
              answeredCount={answeredCount}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
            />
          </form>
        </FormProvider>
      </div>
    );
  }
);

QuizTakingForm.displayName = "QuizTakingForm";
export default QuizTakingForm;