"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
// react-hook-form
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// lucide icons
import { Loader2 } from "lucide-react";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// actions
import { newQuiz, saveQuiz } from "@/actions/quiz";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
// sections
import QuestionCard from "./question-card";
import QuestionEditorDialog from "./question-editor-dialog";

// Schema definitions
const choiceSchema = z.object({
  text: z.string().min(1, { message: "Choice text is required" }),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  text: z.string().min(5, { message: "Question text is required" }),
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
  quiz?: any;
  isEdit?: boolean;
};

// Reusable default question constant
const DEFAULT_QUESTION = {
  text: "",
  type: "multiple_choice" as const,
  timer: undefined,
  points: 1,
  choices: [{ text: "", isCorrect: false }],
};

export default function QuizForm({ quiz, isEdit = false }: Props) {
  const { push } = useRouter();
  const user = useCurrentUser();

  const [saveState, saveAction, isSavePending] = useActionState(saveQuiz, {
    message: "",
  });
  const [newState, newAction, isNewPending] = useActionState(newQuiz, {
    message: "",
    quizId: "",
  });

  // Prepare default form values (using DEFAULT_QUESTION when no quiz is provided)
  const defaultValues: QuizFormValues = {
    title: quiz?.title || "Untitled Quiz",
    timer: quiz?.timer,
    questions: quiz?.questions?.map((q: any) => ({
      text: q.text,
      type: q.type || "multiple_choice",
      timer: q.timer || 60,
      points: q.points || 1,
      choices: q.choices.map((c: any) => ({
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    })) || [DEFAULT_QUESTION],
  };

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  // Manage questions array
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
    update: updateQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });


  const onSubmit = (data: QuizFormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
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

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quiz Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <div className="text-sm text-gray-500">
              {titleValue.length} / 30
            </div>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter quiz title"
              maxLength={30}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
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
                  question={field}
                  quizHasIndividualTimers={true}
                  onUpdate={(updatedQuestion) => {
                    updateQuestion(index, updatedQuestion);
                  }}
                  onDelete={() => removeQuestion(index)}
                />
              ))}
            </div>
            {errors.questions &&
              typeof errors.questions.message === "string" && (
                <p className="text-red-500 text-sm">
                  {errors.questions.message}
                </p>
              )}
            <QuestionEditorDialog
              onSave={(newQuestionData) => {
                const completeQuestion = {
                  ...DEFAULT_QUESTION,
                  text: newQuestionData.text,
                  choices: newQuestionData.choices,
                };
                appendQuestion(completeQuestion);
              }}
              triggerText="Add Question"
            />
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
      </FormProvider>
    </div>
  );
}
