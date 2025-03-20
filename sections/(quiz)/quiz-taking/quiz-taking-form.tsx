"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm, Controller, useWatch, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuizWithQuestions } from "@/types/quiz";

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

export type QuizTakingFormValues = {
  answers: Record<string, string>;
};

const QuizTakingForm = forwardRef<QuizTakingFormRef, QuizTakingFormProps>(
  ({ quiz, onSubmit, onAutoSave, initialAnswers }, ref) => {
    const { control, handleSubmit, reset, getValues, register } =
      useForm<QuizTakingFormValues>({
        defaultValues: {
          answers:
            initialAnswers ??
            quiz.questions.reduce((acc, q) => {
              acc[q.id] = "";
              return acc;
            }, {} as Record<string, string>),
        },
      });

    // Expose form methods to parent.
    useImperativeHandle(ref, () => ({
      getValues,
      triggerSubmit: handleSubmit(onSubmit),
    }));

    // Reset form if initialAnswers change.
    useEffect(() => {
      if (initialAnswers !== undefined) {
        reset({ answers: initialAnswers });
        console.log("Form reset with initialAnswers:", initialAnswers);
      }
    }, [initialAnswers, reset]);

    // Watch for changes to the answers.
    const watchedAnswers = useWatch({ control, name: "answers" });

    useEffect(() => {
      if (onAutoSave) {
        const timer = setTimeout(() => {
          const currentValues = getValues();
          console.log("Auto-saving values:", currentValues);
          // Ensure each question id exists
          if (
            Object.keys(currentValues.answers).length === quiz.questions.length
          ) {
            onAutoSave(currentValues);
          } else {
            console.error(
              "Auto-save skipped: not all question IDs are present",
              currentValues.answers
            );
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [watchedAnswers, onAutoSave, getValues, quiz.questions.length]);

    const allAnswered = Object.values(getValues("answers")).every(
      (answer) => answer.trim() !== ""
    );

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {quiz.questions.map((question) => (
          <div key={question.id} className="p-4 border rounded shadow-sm">
            <p className="mb-2 font-semibold">{question.text}</p>
            {/* Hidden input is no longer needed since we use the question id as key */}
            {question.type === "multiple_choice" ? (
              <Controller
                control={control}
                name={`answers.${question.id}`}
                defaultValue={
                  initialAnswers ? initialAnswers[question.id] ?? "" : ""
                }
                render={({ field }) => {
                  console.log(
                    `For question ${question.id}, current answer value:`,
                    field.value
                  );
                  return (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(val) => {
                        console.log(
                          `For question ${question.id}: onValueChange fired with:`,
                          val
                        );
                        field.onChange(val);
                      }}
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
                  );
                }}
              />
            ) : (
              <Controller
                control={control}
                name={`answers.${question.id}`}
                defaultValue={
                  initialAnswers ? initialAnswers[question.id] ?? "" : ""
                }
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
export default QuizTakingForm;
