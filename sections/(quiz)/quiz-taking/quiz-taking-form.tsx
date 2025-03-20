"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
// react-hook-form
import { useForm, Controller, useWatch } from "react-hook-form";
// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// lucide icons
import { CheckCircle, Circle, Send, Clock } from "lucide-react";
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
 * Enhanced quiz form component that renders quiz questions with improved UI
 * and manages user input via react-hook-form.
 *
 * Features:
 * - Auto-saves answers after a brief typing delay
 * - Shows progress indicator for question completion
 * - Visually distinguishes answered/unanswered questions
 * - Provides clear visual feedback for form state
 */
const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers }, ref) => {
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

      const timer = setTimeout(() => {
        const currentValues = getValues();
        // Only auto-save if all questions exist in answers
        if (
          Object.keys(currentValues.answers).length === quiz.questions.length
        ) {
          onAutoSave(currentValues);
        }
      }, AUTO_SAVE_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    }, [watchedAnswers, onAutoSave, getValues, quiz.questions.length]);

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

    return (
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Progress indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">
                Progress: {answeredCount}/{totalQuestions} questions answered
              </div>
              <Badge
                variant={allAnswered ? "default" : "secondary"}
                className="ml-2"
              >
                {allAnswered ? "Complete" : "In Progress"}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Auto-save indicator */}
        {onAutoSave && (
          <Alert variant="default" className="mb-6 bg-muted/50">
            <Clock className="h-4 w-4 mr-2" />
            <AlertDescription>
              Your answers are automatically saved as you type
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isAnswered = answers[question.id]?.trim() !== "";

            return (
              <Card
                key={question.id}
                className={`transition-all duration-200 ${
                  isAnswered
                    ? "border-green-200 bg-green-50/30"
                    : "border-gray-200"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <CardTitle className="text-base font-medium">
                      {question.text}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  {question.type === "multiple_choice" ? (
                    <Controller
                      control={control}
                      name={`answers.${question.id}` as const}
                      defaultValue={initialAnswers?.[question.id] ?? ""}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                          className="flex flex-col space-y-3 mt-2"
                        >
                          {question.choices.map((choice) => (
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
                                id={`${question.id}-${choice.id}`}
                                className="text-primary"
                              />
                              <Label
                                htmlFor={`${question.id}-${choice.id}`}
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
                        name={`answers.${question.id}` as const}
                        defaultValue={initialAnswers?.[question.id] ?? ""}
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
                    {isAnswered ? (
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
            );
          })}

          <div className="sticky bottom-4 pt-4 bg-background/80 backdrop-blur-sm border-t">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!allAnswered}
            >
              <Send className="mr-2 h-4 w-4" />
              {allAnswered
                ? "Submit Quiz"
                : `Answer ${totalQuestions - answeredCount} more question${
                    totalQuestions - answeredCount !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

QuizTakingForm.displayName = "QuizTakingForm";
export default QuizTakingForm;
