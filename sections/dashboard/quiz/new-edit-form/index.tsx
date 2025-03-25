"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// react-hook-form
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// lucide icons
import { ChevronUp, ChevronDown, AlertTriangle, Plus } from "lucide-react";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
// actions
import { upsertQuiz } from "@/actions/quiz/quiz-management";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
import { useActionState } from "@/hooks/use-action-state";
// sections
import QuizNewEditQuestionCard from "./quiz-new-edit-question-card";
import QuizNewEditQuestionDialog from "./quiz-new-edit-question-dialog";
import QuizNewEditHeader from "./quiz-new-edit-header";
import QuizNewEditEmptyState from "./quiz-new-edit-empty-state";
// types
import { QuizWithQuestions } from "@/types/quiz";
// toast
import { toast } from "sonner";
// constants
import { QUESTION_TYPES, TIMER_MODES } from "@/constants";

// Schema definitions
const choiceSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, { message: "Choice text is required" }),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  type: z.enum(QUESTION_TYPES, {
    message: "Question type is required",
  }),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .max(10, { message: "Maximum 10 points allowed" })
    .default(1),
  choices: z
    .array(choiceSchema)
    .min(2, { message: "At least two choices are required" })
    .refine((choices) => choices.some((choice) => choice.isCorrect), {
      message: "At least one choice must be marked as correct",
    }),
});

const quizFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title is required (min 4 characters)" })
    .max(80, { message: "Title must be at most 80 characters" })
    .default("Untitled Quiz"),
  timerMode: z.enum(TIMER_MODES).default("none"),
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
  timer: z
    .number()
    .min(60, { message: "Timer must be at least 60 seconds" })
    .optional(),
  shuffleQuestions: z.boolean().default(false),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;

type Props = {
  quiz?: QuizWithQuestions;
  isEdit?: boolean;
};

// Reusable default question constant
const DEFAULT_QUESTION = {
  text: "What is the capital of France?",
  type: "multiple_choice" as const,
  timer: undefined,
  points: 1,
  choices: [
    { text: "Paris", isCorrect: true },
    { text: "London", isCorrect: false },
    { text: "Berlin", isCorrect: false },
    { text: "Madrid", isCorrect: false },
  ],
};

export default function QuizNewEditForm({ quiz, isEdit = false }: Props) {
  const { push } = useRouter();

  const user = useCurrentUser();

  const [isLoading, setIsLoading] = useState(true);
  const [hasChanged, setHasChanged] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const [_, upsertAction, isUpsertPending] = useActionState(upsertQuiz, {
    quizId: "",
    message: "",
  });

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Prepare default form values (using DEFAULT_QUESTION when no quiz is provided)
  const defaultValues: QuizFormValues = {
    title: quiz?.title || "Untitled Quiz",
    timer: quiz?.timer || undefined,
    timerMode: quiz?.timerMode || "none",
    shuffleQuestions: quiz?.shuffleQuestions || false,
    questions: quiz?.questions?.map((q: any) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      timer: q.timer || undefined,
      points: q.points || 1,
      choices: q.choices.map((c: any) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    })) || [DEFAULT_QUESTION],
  };

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = methods;

  // Track form changes
  useEffect(() => {
    setHasChanged(isDirty);
  }, [isDirty]);

  // Show confirmation dialog if trying to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanged) {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanged]);

  // Manage questions array
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
    update: updateQuestion,
    move,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const titleValue = watch("title") || "";
  const timerMode = watch("timerMode");

  const onSubmit = async (data: QuizFormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("timerMode", data.timerMode);
    formData.append("shuffleQuestions", data.shuffleQuestions.toString());
    formData.append("questions", JSON.stringify(data.questions));

    if (data.timer !== undefined) {
      formData.append("timer", data.timer.toString());
    }

    // If editing, append quizId; otherwise, append userId.
    if (isEdit && quiz) {
      formData.append("quizId", quiz.id);
    } else {
      formData.append("userId", user.id || "");
    }

    const promise = upsertAction(formData).then((result: any) => {
      if (result.error) {
        throw new Error(result.message);
      }
      return result;
    });

    toast.promise(promise, {
      loading: "Saving quiz...",
      success: (data: any) => {
        setHasChanged(false);
        push(PATH_DASHBOARD.quiz.view(data.quizId));
        return `Quiz ${isEdit ? "updated" : "created"} successfully!`;
      },
      error: (error: any) => error.message || "Error saving quiz",
    });
  };

  const handleBack = () => {
    if (hasChanged) {
      setConfirmExit(true);
      return;
    }
    navigateBack();
  };

  const navigateBack = () => {
    if (isEdit && quiz) {
      return push(PATH_DASHBOARD.quiz.view(quiz.id));
    }
    push(PATH_DASHBOARD.library.root);
  };

  // Display loading skeletons
  if (isLoading) {
    return (
      <div className="w-full animate-in fade-in-50 duration-300">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-32 w-full rounded-md" />
                <div className="flex flex-col justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen flex flex-col"
      >
        {/* Form Header */}
        <QuizNewEditHeader
          isPending={isUpsertPending}
          onBack={handleBack}
          title={titleValue}
          confirmExit={confirmExit}
          onConfirmExit={() => navigateBack()}
          onCancelExit={() => setConfirmExit(false)}
        />

        {/* Error summary if needed */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors in the form before submitting.
            </AlertDescription>
          </Alert>
        )}

        {/* Questions Section */}
        <div className="space-y-4 p-4 flex-1">
          <div className="flex w-full justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Questions
                <span className="text-sm font-normal text-muted-foreground">
                  ({questionFields.length}{" "}
                  {questionFields.length === 1 ? "question" : "questions"})
                </span>
              </h2>
              {errors.questions &&
                typeof errors.questions.message === "string" && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.questions.message}
                  </p>
                )}
            </div>

            <QuizNewEditQuestionDialog
              onSave={(newQuestionData) => {
                const completeQuestion = {
                  ...DEFAULT_QUESTION,
                  text: newQuestionData.text,
                  choices: newQuestionData.choices,
                };
                appendQuestion(completeQuestion);
                setHasChanged(true);
              }}
              triggerText="Add Question"
            />
          </div>

          {questionFields.length === 0 ? (
            <QuizNewEditEmptyState
              onAddQuestion={() => appendQuestion(DEFAULT_QUESTION)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {questionFields.map((field, index) => (
                <div key={field.id} className="flex flex-row gap-2 group">
                  <div className="flex-1">
                    <QuizNewEditQuestionCard
                      questionIndex={index}
                      question={field}
                      timerMode={timerMode}
                      onUpdate={(updatedQuestion) => {
                        updateQuestion(index, updatedQuestion);
                        setHasChanged(true);
                      }}
                      onDelete={() => {
                        removeQuestion(index);
                        setHasChanged(true);
                      }}
                      onDuplicate={(questionData) => {
                        const newQuestion = {
                          ...questionData,
                          id: undefined,
                          choices: questionData.choices.map((choice) => ({
                            ...choice,
                            id: undefined,
                          })),
                        };
                        appendQuestion(newQuestion);
                        setHasChanged(true);
                      }}
                    />
                  </div>

                  {/* Reorder Controls - Only show on hover or focus for cleaner UI */}
                  <div className="flex flex-col justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      onClick={() => {
                        move(index, index - 1);
                        setHasChanged(true);
                      }}
                      disabled={index === 0}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        move(index, index + 1);
                        setHasChanged(true);
                      }}
                      disabled={index === questionFields.length - 1}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick add button at the bottom */}
          {questionFields.length > 0 && (
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex justify-center">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    appendQuestion(DEFAULT_QUESTION);
                    setHasChanged(true);
                  }}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add another question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
