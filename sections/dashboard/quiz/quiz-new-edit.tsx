"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
// react-hook-form
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
// types
import { QuizWithQuestions } from "@/types/quiz";
// actions
import { newQuiz, saveQuiz } from "@/actions/quiz";
// icons
import { Loader2, Plus, Trash2, Delete } from "lucide-react";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

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
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(30, { message: "Title must be at most 30 characters" }),
  description: z
    .string()
    .max(100, { message: "Description must be at most 100 characters" })
    .optional(),
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
    <AccordionItem
      key={questionIndex}
      value={questionIndex.toString()}
      className="border p-4 rounded m-4"
    >
      <AccordionTrigger>
        <Label htmlFor={`questions.${questionIndex}.text`}>
          Question {questionIndex + 1}
        </Label>
      </AccordionTrigger>

      <AccordionContent>
        {/* Question Text */}
        <div className="space-y-2">
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
                <Delete />
              </Button>
            </div>
          ))}
          {questionError?.choices &&
            typeof questionError.choices.message === "string" && (
              <p className="text-red-500 text-sm">
                {questionError.choices.message}
              </p>
            )}
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              onClick={() => appendChoice({ text: "", isCorrect: false })}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* Remove Question Button */}
        <div className="mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => removeQuestion(questionIndex)}
          >
            <Trash2 />
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

type Props = {
  quiz?: QuizWithQuestions;
  isEdit?: boolean;
};

export default function QuizNewEdit({ quiz, isEdit = false }: Props) {
  const { push } = useRouter();

  const [openItems, setOpenItems] = useState<string[]>([]);

  const [saveState, saveAction, isSavePending] = useActionState(saveQuiz, {
    message: "",
  });

  const [newState, newAction, isNewPending] = useActionState(newQuiz, {
    message: "",
    quizId: "",
  });

  // Convert the passed quiz data to default form values.
  const defaultValues: QuizFormValues = {
    title: quiz?.title || "",
    description: quiz?.description || "",
    questions: quiz?.questions?.map((q) => ({
      text: q.text,
      choices: q.choices.map((c) => ({
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    })) || [{ text: "", choices: [{ text: "", isCorrect: false }] }],
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
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
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description ?? "");
    formData.append("questions", JSON.stringify(data.questions));

    if (isEdit && quiz) {
      formData.append("quizId", quiz.id);

      startTransition(() => {
        saveAction(formData);
      });
      return;
    }

    startTransition(() => {
      newAction(formData);
    });
  };

  useEffect(() => {
    if (newState.quizId && !isNewPending) {
      push(PATH_DASHBOARD.quiz.view(newState.quizId));
    }
  }, [newState.quizId, isNewPending, push]);

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Quiz Title</Label>
          {/* Character counter */}
          <div className="text-sm text-gray-500">{titleValue.length} / 30</div>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter quiz title"
            maxLength={30} // enforce limit at the input level
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Quiz Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          {/* Character counter */}
          <div className="text-sm text-gray-500">
            {descriptionValue.length} / 100
          </div>
          <Input
            id="description"
            {...register("description")}
            placeholder="Enter quiz description"
            maxLength={100} // enforce limit at the input level
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Questions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Accordion
              type="multiple"
              className="w-full"
              value={openItems}
              onValueChange={(values) => setOpenItems(values)}
            >
              {questionFields.map((field, index) => (
                <QuestionEditor
                  key={field.id}
                  questionIndex={index}
                  control={control}
                  register={register}
                  removeQuestion={(i) => {
                    removeQuestion(i);
                    setOpenItems((prev) =>
                      prev.filter((v) => v !== i.toString())
                    );
                  }}
                  questionError={
                    errors.questions ? errors.questions[index] : null
                  }
                />
              ))}
            </Accordion>
          </div>
          {errors.questions && typeof errors.questions.message === "string" && (
            <p className="text-red-500 text-sm">{errors.questions.message}</p>
          )}
          <Button
            type="button"
            onClick={() => {
              // Append a new question.
              appendQuestion({
                text: "",
                choices: [{ text: "", isCorrect: false }],
              });
              // The new question's index will be the current length.
              setOpenItems((prev) => [
                ...prev,
                questionFields.length.toString(),
              ]);
            }}
          >
            Add Question
          </Button>
        </div>

        <Button type="submit">
          {isSavePending || isNewPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <span>Save Quiz</span>
          )}
        </Button>

        {saveState.message && (
          <p className="text-sm text-gray-400 mb-2">{saveState.message}</p>
        )}
      </form>
    </div>
  );
}
