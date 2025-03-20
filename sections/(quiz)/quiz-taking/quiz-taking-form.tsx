"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
// react-hook-form
import { useForm, Controller, useWatch } from "react-hook-form";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

/**
 * Renders the quiz questions and manages user input via react-hook-form.
 * Auto-saves changes if `onAutoSave` is provided.
 * Calls `onSubmit` when the user manually submits.
 */
const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers }, ref) => {
    const { control, handleSubmit, reset, getValues } =
      useForm<QuizTakingFormValues>({
        defaultValues: {
          answers: initialAnswers
            ? initialAnswers
            : quiz.questions.reduce((acc, q) => {
                acc[q.id] = "";
                return acc;
              }, {} as Record<string, string>),
        },
      });

    useImperativeHandle(ref, () => ({
      getValues,
      triggerSubmit: handleSubmit(onSubmit),
    }));

    // Reset form if parent's initialAnswers changes
    useEffect(() => {
      if (initialAnswers !== undefined) {
        reset({ answers: initialAnswers });
      }
    }, [initialAnswers, reset]);

    // Debounce-based auto-save for each update in answers
    const watchedAnswers = useWatch({ control, name: "answers" });
    useEffect(() => {
      if (!onAutoSave) return;

      const AUTO_SAVE_DEBOUNCE_MS = 500;
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

    // Check if all questions are answered to enable the submit button
    const allAnswered = Object.values(getValues("answers")).every(
      (answer) => answer.trim() !== ""
    );

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {quiz.questions.map((question) => (
          <div key={question.id} className="p-4 border rounded shadow-sm">
            <p className="mb-2 font-semibold">{question.text}</p>

            {question.type === "multiple_choice" ? (
              <Controller
                control={control}
                name={`answers.${question.id}` as const}
                defaultValue={initialAnswers?.[question.id] ?? ""}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                    className="flex flex-col space-y-2"
                  >
                    {question.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={choice.text}
                          id={`${question.id}-${choice.id}`}
                        />
                        <span>{choice.text}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            ) : (
              <Controller
                control={control}
                name={`answers.${question.id}` as const}
                defaultValue={initialAnswers?.[question.id] ?? ""}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Your answer"
                    className="w-full"
                  />
                )}
              />
            )}
          </div>
        ))}

        {allAnswered && (
          <Button type="submit" className="mt-4">
            Submit Quiz
          </Button>
        )}
      </form>
    );
  }
);

QuizTakingForm.displayName = "QuizTakingForm";
export default QuizTakingForm;
