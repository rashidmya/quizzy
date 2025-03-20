"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm, Controller, useWatch, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuizWithQuestions } from "@/types/quiz";

export type QuizTakingFormValues = {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
};

interface QuizTakingFormProps {
  quiz: QuizWithQuestions;
  onSubmit: (data: QuizTakingFormValues) => Promise<void>;
  onAutoSave?: (data: QuizTakingFormValues) => Promise<void>;
  initialAnswers?: QuizTakingFormValues["answers"];
}

export interface QuizTakingFormRef {
  getValues: () => QuizTakingFormValues;
  triggerSubmit: () => void;
}

const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers }, ref) => {
    const { control, handleSubmit, reset, getValues } =
      useForm<QuizTakingFormValues>({
        defaultValues: {
          answers:
            initialAnswers && initialAnswers.length > 0
              ? initialAnswers
              : quiz.questions.map((q) => ({
                  questionId: q.id,
                  answer: "",
                })),
        },
      });

    // Expose form methods to parent.
    useImperativeHandle(ref, () => ({
      getValues,
      triggerSubmit: handleSubmit(onSubmit),
    }));

    // Reset form when initialAnswers change.
    useEffect(() => {
      if (initialAnswers && initialAnswers.length > 0) {
        reset({ answers: initialAnswers });
      }
    }, [initialAnswers, reset]);

    // Watch for changes.
    const watchedValues = useWatch({ control });

    // Debounce auto-save.
    useEffect(() => {
      if (onAutoSave) {
        const timer = setTimeout(() => {
          onAutoSave(getValues());
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [watchedValues, onAutoSave, getValues]);

    const allAnswered = getValues("answers").every(
      (a) => a.answer.trim() !== ""
    );

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="p-4 border rounded shadow-sm">
            <p className="mb-2 font-semibold">{question.text}</p>
            {question.type === "multiple_choice" ? (
              <Controller
                control={control}
                name={`answers.${index}.answer`}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
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
                name={`answers.${index}.answer`}
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
        {allAnswered && <Button type="submit">Submit Quiz</Button>}
      </form>
    );
  }
);

QuizTakingForm.displayName = "QuizTakingForm";
export default React.forwardRef(QuizTakingForm);
