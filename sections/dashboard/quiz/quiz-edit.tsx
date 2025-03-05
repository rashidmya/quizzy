"use client";

import React, { startTransition, useActionState } from "react";
// react-hook-form
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// types
import { QuizWithQuestions } from "@/types/quiz";
// actions
import { saveQuiz } from "@/actions/quiz";
import { Loader2 } from "lucide-react";

type Props = {
  quiz: QuizWithQuestions;
};

// Define a schema for a choice.
const choiceSchema = z.object({
  text: z.string().min(1, { message: "Choice text is required" }),
  isCorrect: z.boolean().default(false),
});

// Define a schema for a question, which includes a text and an array of choices.
const questionSchema = z.object({
  text: z.string().min(1, { message: "Question text is required" }),
  choices: z
    .array(choiceSchema)
    .min(1, { message: "At least one choice is required" }),
});

// Define the overall quiz form schema.
const quizFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

/**
 * Child component for editing a single question and its choices.
 * This component handles its own useFieldArray hook for choices.
 */
interface QuestionEditorProps {
  questionIndex: number;
  control: UseFormReturn<QuizFormValues>["control"];
  register: UseFormReturn<QuizFormValues>["register"];
  removeQuestion: (index: number) => void;
  questionError: any; // You can refine this type as needed.
}

function QuestionEditor({
  questionIndex,
  control,
  register,
  removeQuestion,
  questionError,
}: QuestionEditorProps) {
  // Manage the choices array for this particular question.
  const {
    fields: choiceFields,
    append: appendChoice,
    remove: removeChoice,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices` as const,
  });

  return (
    <div key={questionIndex} className="border p-4 rounded">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor={`questions.${questionIndex}.text`}>
          Question {questionIndex + 1}
        </Label>
        <Input
          id={`questions.${questionIndex}.text`}
          {...register(`questions.${questionIndex}.text` as const)}
          placeholder="Enter question text"
        />
        {questionError?.text && (
          <p className="text-red-500 text-sm">{questionError.text.message}</p>
        )}
      </div>

      {/* Choices Section */}
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold">Choices</h3>
        {choiceFields.map((choiceField, choiceIndex) => (
          <div key={choiceField.id} className="flex items-center space-x-2">
            <Input
              {...register(
                `questions.${questionIndex}.choices.${choiceIndex}.text` as const
              )}
              placeholder={`Choice ${choiceIndex + 1}`}
              className="flex-1"
            />
            <label className="flex items-center space-x-1">
              <Input
                type="checkbox"
                {...register(
                  `questions.${questionIndex}.choices.${choiceIndex}.isCorrect` as const
                )}
              />
              <span>Correct</span>
            </label>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeChoice(choiceIndex)}
            >
              Remove Choice
            </Button>
          </div>
        ))}
        {questionError?.choices &&
          typeof questionError.choices.message === "string" && (
            <p className="text-red-500 text-sm">
              {questionError.choices.message}
            </p>
          )}
        <Button
          type="button"
          onClick={() => appendChoice({ text: "", isCorrect: false })}
        >
          Add Choice
        </Button>
      </div>

      {/* Remove Question Button */}
      <div className="mt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={() => removeQuestion(questionIndex)}
        >
          Remove Question
        </Button>
      </div>
    </div>
  );
}

export default function QuizEdit({ quiz }: Props) {
  const [addState, addAction, isAddPending] = useActionState(saveQuiz, {
    message: "",
  });

  // Convert the passed quiz data to default form values.
  const defaultValues: QuizFormValues = {
    title: quiz.title,
    description: quiz.description ?? "",
    questions: quiz.questions.map((q) => ({
      text: q.text,
      choices: q.choices.map((c) => ({
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    })),
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
  });

  // Manage the array of questions.
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = (data: QuizFormValues) => {
    console.log("Submitted data:", data);

    const formData = new FormData();
    formData.append("quizId", quiz.id);
    formData.append("title", data.title);
    formData.append("description", data.description ?? "");
    formData.append("questions", JSON.stringify(data.questions));

    startTransition(() => {
      addAction(formData);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Quiz Title</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter quiz title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Quiz Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register("description")}
            placeholder="Enter quiz description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Questions</h2>
          {questionFields.map((field, index) => (
            <QuestionEditor
              key={field.id}
              questionIndex={index}
              control={control}
              register={register}
              removeQuestion={removeQuestion}
              questionError={errors.questions ? errors.questions[index] : null}
            />
          ))}
          {errors.questions && typeof errors.questions.message === "string" && (
            <p className="text-red-500 text-sm">{errors.questions.message}</p>
          )}
          <Button
            type="button"
            onClick={() =>
              appendQuestion({
                text: "",
                choices: [{ text: "", isCorrect: false }],
              })
            }
          >
            Add Question
          </Button>
        </div>

        <Button type="submit">
          {isAddPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <span>Save Quiz</span>
          )}
        </Button>
        {addState.message && (
          <p className="text-sm text-gray-400 mb-2">{addState.message}</p>
        )}
      </form>
    </div>
  );
}
