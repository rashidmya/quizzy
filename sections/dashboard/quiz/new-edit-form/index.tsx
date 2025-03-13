"use client";

import { startTransition, useActionState, useEffect, useState } from "react"; // react hooks
import { useRouter } from "next/navigation"; // next
import { useForm, useFieldArray } from "react-hook-form"; // react-hook-form
import { z } from "zod"; // zod
import { zodResolver } from "@hookform/resolvers/zod"; // zod resolver
import { Button } from "@/components/ui/button"; // components
import { Input } from "@/components/ui/input"; // components
import { Label } from "@/components/ui/label"; // components
import { newQuiz, saveQuiz } from "@/actions/quiz"; // actions
import { Loader2 } from "lucide-react"; // icons
import { PATH_DASHBOARD } from "@/routes/paths"; // paths
import { useCurrentUser } from "@/hooks/use-current-user"; // hooks
import QuestionCard from "./question-card"; // sections

// Define a schema for a choice.
const choiceSchema = z.object({
  text: z.string().min(1, { message: "Choice text is required" }),
  isCorrect: z.boolean().default(false),
});

// Define a schema for a question, which now includes additional fields.
const questionSchema = z.object({
  text: z.string().min(1, { message: "Question text is required" }),
  type: z.enum(["open_ended", "multiple_choice"]),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .default(1),
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
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

type Props = {
  quiz?: any; // quiz is optional; refine as needed
  isEdit?: boolean;
};

export default function QuizForm({ quiz, isEdit = false }: Props) {
  const { push } = useRouter(); // next
  const user = useCurrentUser(); // hooks

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
    timer: quiz?.timer || undefined,
    questions: quiz?.questions?.map((q: any) => ({
      text: q.text,
      type: q.type || "multiple_choice",
      timer: q.timer || 60,
      points: q.points || 1,
      choices: q.choices.map((c: any) => ({
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    })) || [
      {
        text: "",
        type: "multiple_choice",
        timer: 60,
        points: 1,
        choices: [{ text: "", isCorrect: false }],
      },
    ],
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
    // Append quiz timer if provided
    if (data.timer !== undefined) {
      formData.append("timer", data.timer.toString());
    }
    formData.append("questions", JSON.stringify(data.questions));

    if (isEdit && quiz) {
      formData.append("quizId", quiz.id);
      startTransition(() => {
        saveAction(formData);
      });
      return;
    }

    formData.append("userId", user.id || "");

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
            {questionFields.map((field, index) => (
              <QuestionCard
                key={field.id}
                questionIndex={index}
                question={field} // field contains the current question data
                quizHasIndividualTimers={true}
                onUpdate={(updatedQuestion) => {
                  // Update the question at this index; e.g., using setValue from react-hook-form
                  // For example: setValue(`questions.${index}`, updatedQuestion);
                }}
                onDelete={() => removeQuestion(index)}
                control={control} // pass control here
                register={register} // pass register here
              />
            ))}
          </div>
          {errors.questions && typeof errors.questions.message === "string" && (
            <p className="text-red-500 text-sm">{errors.questions.message}</p>
          )}
          <Button
            type="button"
            onClick={() => {
              // Append a new question with default values.
              appendQuestion({
                text: "",
                type: "multiple_choice", // default type
                timer: 60, // default timer in seconds
                points: 1, // default points
                choices: [{ text: "", isCorrect: false }],
              });
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
        {newState.message && (
          <p className="text-sm text-gray-400 mb-2">{newState.message}</p>
        )}
      </form>
    </div>
  );
}
