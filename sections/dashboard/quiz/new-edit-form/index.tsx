"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// react-hook-form
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// components
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
// custom components
import QuizHeader from "./components/quiz-header";
import QuizQuestionsList from "./components/quiz-questions-list";
import QuizEmptyState from "./components/quiz-empty-state";
import QuizSettingsDialog from "./components/quiz-settings-dialog";
// icons
import { AlertTriangle, Plus } from "lucide-react";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
import { useActionState } from "@/hooks/use-action-state";
// actions
import { upsertQuiz } from "@/actions/quiz/quiz-management";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// constants
import { QUESTION_TYPES, TIMER_MODES } from "@/constants";
// toast
import { toast } from "sonner";
// types and schemas
import { quizFormSchema } from "./schemas/quiz-form-schema";
import { createDefaultQuestion } from "./utils/default-question";
import { QuizWithQuestions } from "@/types/quiz";

export type QuizFormValues = z.infer<typeof quizFormSchema>;

type Props = {
  quiz?: QuizWithQuestions;
  isEdit?: boolean;
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

  // Simulate loading state for UI feedback
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Prepare default form values based on whether we're editing or creating
  let defaultValues: QuizFormValues;

  if (isEdit && quiz) {
    // Map the existing quiz data for editing
    defaultValues = {
      title: quiz.title,
      timer: quiz.timer || undefined,
      timerMode: quiz.timerMode || "none",
      shuffleQuestions: quiz.shuffleQuestions || false,
      questions:
        quiz.questions?.map((q: any) => {
          // Handle different question types
          if (q.type === "multiple_choice") {
            return {
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
            };
          } else if (q.type === "true_false") {
            return {
              id: q.id,
              text: q.text,
              type: q.type,
              timer: q.timer || undefined,
              points: q.points || 1,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            };
          } else if (q.type === "fill_in_blank") {
            return {
              id: q.id,
              text: q.text,
              type: q.type,
              timer: q.timer || undefined,
              points: q.points || 1,
              correctAnswer: q.correctAnswer,
              acceptedAnswers: q.acceptedAnswers,
            };
          } else if (q.type === "open_ended") {
            return {
              id: q.id,
              text: q.text,
              type: q.type,
              timer: q.timer || undefined,
              points: q.points || 1,
              guidelines: q.guidelines,
            };
          }

          // Default case
          return createDefaultQuestion("multiple_choice");
        }) || [],
    };
  } else {
    // Default values for new quiz
    defaultValues = {
      title: "Untitled Quiz",
      timer: undefined,
      timerMode: "none",
      shuffleQuestions: false,
      questions: [createDefaultQuestion("multiple_choice")],
    };
  }

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

  // Track when form changes
  useEffect(() => {
    setHasChanged(isDirty);
  }, [isDirty]);

  // Show confirmation dialog before leaving page with unsaved changes
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

  // Field array for questions
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
      loading: isEdit ? "Updating quiz..." : "Creating quiz...",
      success: (data: any) => {
        setHasChanged(false);
        push(PATH_DASHBOARD.quiz.view(data.quizId));
        return isEdit
          ? "Quiz updated successfully!"
          : "Quiz created successfully!";
      },
      error: (error: any) =>
        error.message || `Error ${isEdit ? "updating" : "creating"} quiz`,
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

  const handleAddQuestion = (type: keyof typeof QUESTION_TYPES) => {
    appendQuestion(createDefaultQuestion(type));
    setHasChanged(true);
  };

  // Display loading skeleton
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
        {/* Quiz Header with title and actions */}
        <QuizHeader
          isPending={isUpsertPending}
          onBack={handleBack}
          title={titleValue}
          confirmExit={confirmExit}
          onConfirmExit={() => navigateBack()}
          onCancelExit={() => setConfirmExit(false)}
          isEdit={isEdit}
        />

        {/* Form errors summary */}
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

            {/* Add question dropdown */}
            <QuizSettingsDialog onAddQuestion={handleAddQuestion} />
          </div>

          {/* Question list or empty state */}
          {questionFields.length === 0 ? (
            <QuizEmptyState
              onAddQuestion={() => handleAddQuestion("multiple_choice")}
            />
          ) : (
            <QuizQuestionsList
              questionFields={questionFields}
              timerMode={timerMode}
              onUpdate={updateQuestion}
              onDelete={removeQuestion}
              onDuplicate={(questionData) => {
                const newQuestion = {
                  ...questionData,
                  id: undefined,
                  choices: questionData.choices?.map((choice) => ({
                    ...choice,
                    id: undefined,
                  })),
                };
                appendQuestion(newQuestion);
                setHasChanged(true);
              }}
              onMove={move}
              onChange={() => setHasChanged(true)}
            />
          )}

          {/* Quick add button at the bottom */}
          {questionFields.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleAddQuestion("multiple_choice")}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add another question
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
