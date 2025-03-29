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
import QuizNewEditHeader from "./quiz-new-edit-header";
import QuizNewEditEmptyState from "./quiz-new-edit-empty-state";
// types
import { QuizWithQuestions } from "@/types/quiz";
// toast
import { toast } from "sonner";
// constants
import { QUESTION_TYPES, TIMER_MODES } from "@/constants";

const quizFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title is required (min 4 characters)" })
    .max(80, { message: "Title must be at most 80 characters" })
    .default("Untitled Quiz"),
  timerMode: z.enum(TIMER_MODES).default("none"),
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

/**
 * Creates a default question template for new quizzes
 * @returns {Object} Default question object
 */
const createDefaultQuestion = () => ({
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
});

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

  const titleValue = watch("title") || "";
  const timerMode = watch("timerMode");

  const onSubmit = async (data: QuizFormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("timerMode", data.timerMode);
    formData.append("shuffleQuestions", data.shuffleQuestions.toString());

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
      </form>
    </FormProvider>
  );
}
