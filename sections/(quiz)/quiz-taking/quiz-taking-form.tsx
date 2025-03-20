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
}

export interface QuizTakingFormRef {
  getValues: UseFormReturn<QuizTakingFormValues>["getValues"];
  triggerSubmit: () => void;
}

const QuizTakingForm = forwardRef<
  QuizTakingFormRef,
  QuizTakingFormProps
>(({ quiz, onSubmit, onAutoSave }, ref) => {
  const { control, handleSubmit, getValues } = useForm<QuizTakingFormValues>({
    defaultValues: {
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        answer: "",
      })),
    },
  });

  useImperativeHandle(ref, () => ({
    getValues,
    triggerSubmit: handleSubmit(onSubmit),
  }));

  // Watch answers and auto-save.
  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave(getValues());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, onAutoSave, getValues]);

  // Check if all questions are answered.
  const allAnswered = getValues("answers").every((a) => a.answer.trim() !== "");

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
});

QuizTakingForm.displayName = "QuizTakingForm";
export default QuizTakingForm;
