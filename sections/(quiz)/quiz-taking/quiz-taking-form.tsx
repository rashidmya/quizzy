"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from "react";
// react-hook-form
import { useForm, Controller, useWatch } from "react-hook-form";
// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
// lucide icons
import {
  CheckCircle,
  Circle,
  Send,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
} from "lucide-react";
// types
import { QuizWithQuestions } from "@/types/quiz";

export interface QuizTakingFormRef {
  getValues: () => QuizTakingFormValues;
  triggerSubmit: () => void;
}

export type QuizTakingFormValues = {
  answers: Record<string, string>;
};

interface QuizTakingFormProps {
  quiz: QuizWithQuestions;
  onSubmit: (data: QuizTakingFormValues) => Promise<void>;
  onAutoSave?: (data: QuizTakingFormValues) => Promise<void>;
  initialAnswers?: QuizTakingFormValues["answers"];
}

const AUTO_SAVE_DEBOUNCE_MS = 500;

/**
 * Enhanced quiz form component that renders one question at a time with pagination
 * and manages user input via react-hook-form.
 *
 * Features:
 * - Navigation between questions with Next/Back buttons
 * - Clickable question indicators for direct navigation
 * - Auto-saves answers when they change
 * - Shows save status feedback
 * - Visually distinguishes answered/unanswered questions
 */
const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers }, ref) => {
    // Current question index state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Save status state
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
      "idle"
    );

    const { control, handleSubmit, reset, getValues } =
      useForm<QuizTakingFormValues>({
        defaultValues: {
          answers:
            initialAnswers ||
            quiz.questions.reduce((acc, q) => {
              acc[q.id] = "";
              return acc;
            }, {} as Record<string, string>),
        },
      });

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getValues,
      triggerSubmit: handleSubmit(onSubmit),
    }));

    // Reset form when initialAnswers changes
    useEffect(() => {
      if (initialAnswers !== undefined) {
        reset({ answers: initialAnswers });
      }
    }, [initialAnswers, reset]);

    // Watch answers for auto-save functionality
    const watchedAnswers = useWatch({ control, name: "answers" });

    // Implement debounced auto-save
    useEffect(() => {
      if (!onAutoSave) return;

      setSaveStatus("saving");

      const timer = setTimeout(() => {
        const currentValues = getValues();
        onAutoSave(currentValues).then(() => {
          setSaveStatus("saved");

          // Reset save status after 2 seconds
          const resetTimer = setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);

          return () => clearTimeout(resetTimer);
        });
      }, AUTO_SAVE_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    }, [watchedAnswers, onAutoSave, getValues]);

    // Track quiz completion progress
    const answers = getValues("answers");
    const answeredCount = Object.values(answers).filter(
      (answer) => answer.trim() !== ""
    ).length;
    const totalQuestions = quiz.questions.length;
    const progressPercentage = Math.round(
      (answeredCount / totalQuestions) * 100
    );
    const allAnswered = answeredCount === totalQuestions;

    // Navigation functions
    const goToNextQuestion = () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    const goToPreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    };

    const goToQuestion = (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
      }
    };

    // Get current question
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCurrentQuestionAnswered =
      answers[currentQuestion.id]?.trim() !== "";

    // Render question pagination indicators
    const renderQuestionIndicators = () => {
      return (
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {quiz.questions.map((question, index) => {
            const isAnswered = answers[question.id]?.trim() !== "";
            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={index}
                variant={
                  isCurrent ? "default" : isAnswered ? "outline" : "secondary"
                }
                size="sm"
                className={`w-10 h-10 p-0 rounded-full ${
                  isAnswered ? "border-green-500" : ""
                } ${isCurrent ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                onClick={() => goToQuestion(index)}
              >
                <span className="sr-only">Question {index + 1}</span>
                {isAnswered ? (
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      isCurrent ? "text-white" : "text-green-500"
                    }`}
                  />
                ) : (
                  index + 1
                )}
              </Button>
            );
          })}
        </div>
      );
    };

    return (
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress indicator */}
        {/* Question navigation */}
        {renderQuestionIndicators()}

        {/* Auto-save indicator */}
        {onAutoSave && (
          <Alert
            variant="default"
            className={`mb-6 transition-colors duration-300 ${
              saveStatus === "idle"
                ? "bg-muted/50"
                : saveStatus === "saving"
                ? "bg-amber-50"
                : "bg-green-50"
            }`}
          >
            {saveStatus === "idle" && <Clock className="h-4 w-4 mr-2" />}
            {saveStatus === "saving" && (
              <Save className="h-4 w-4 mr-2 animate-pulse text-amber-500" />
            )}
            {saveStatus === "saved" && (
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            )}

            <AlertDescription>
              {saveStatus === "idle" &&
                "Your answers are automatically saved as you progress"}
              {saveStatus === "saving" && "Saving your answer..."}
              {saveStatus === "saved" && "Answer saved successfully"}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current question card */}
          <Card
            key={currentQuestion.id}
            className={`transition-all duration-200 ${
              isCurrentQuestionAnswered
                ? "border-green-200 bg-green-50/30"
                : "border-gray-200"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium">
                  {currentQuestionIndex + 1}
                </div>
                <CardTitle className="text-base font-medium">
                  {currentQuestion.text}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              {currentQuestion.type === "multiple_choice" ? (
                <Controller
                  control={control}
                  name={`answers.${currentQuestion.id}` as const}
                  defaultValue={initialAnswers?.[currentQuestion.id] ?? ""}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      className="flex flex-col space-y-3 mt-2"
                    >
                      {currentQuestion.choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`flex items-center space-x-2 p-3 rounded-md border ${
                            field.value === choice.text
                              ? "bg-primary/5 border-primary"
                              : "border-gray-200 hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={choice.text}
                            id={`${currentQuestion.id}-${choice.id}`}
                            className="text-primary"
                          />
                          <Label
                            htmlFor={`${currentQuestion.id}-${choice.id}`}
                            className="flex-grow cursor-pointer font-normal"
                          >
                            {choice.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              ) : (
                <div className="mt-2">
                  <Controller
                    control={control}
                    name={`answers.${currentQuestion.id}` as const}
                    defaultValue={initialAnswers?.[currentQuestion.id] ?? ""}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Type your answer here..."
                        className="w-full"
                      />
                    )}
                  />
                </div>
              )}

              {/* Answer status indicator */}
              <div className="flex items-center justify-end mt-2 text-sm text-muted-foreground">
                {isCurrentQuestionAnswered ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span>Answered</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 text-amber-500 mr-1" />
                    <span>Needs answer</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation and submit controls */}
          <div className="sticky bottom-4 pt-4 bg-background/80 backdrop-blur-sm border-t">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-1/3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button type="submit" className="w-1/3" disabled={!allAnswered}>
                  <Send className="mr-2 h-4 w-4" />
                  {allAnswered
                    ? "Submit Quiz"
                    : `${totalQuestions - answeredCount} unanswered`}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goToNextQuestion}
                  className="w-1/3"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
);

QuizTakingForm.displayName = "QuizTakingForm";
export default QuizTakingForm;
