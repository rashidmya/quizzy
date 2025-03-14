"use client";

import { useEffect } from "react";
import { startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
// react-hook-form
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// lucide icons
import { Loader2, ChevronLeftIcon, ChevronUp, ChevronDown } from "lucide-react";
// shadcn/ui components
import { Button } from "@/components/ui/button";
// actions
import { newQuiz, saveQuiz } from "@/actions/quiz";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
// sections
import QuestionCard from "./question-card";
import QuizNewEditQuestionDialog from "./quiz-new-edit-question-dialog";
// types
import { QUESTION_TYPES } from "@/types/question";
import { QuizWithQuestions } from "@/types/quiz";
import QuizNewEditHeader from "./quiz-new-edit-header";

// Schema definitions
const choiceSchema = z.object({
  text: z.string().min(1, { message: "Choice text is required" }),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  text: z.string({ message: "Question text is required" }),
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
    .default(1),
  choices: z
    .array(choiceSchema)
    .min(1, { message: "At least one choice is required" }),
});

const quizFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title is required" })
    .max(80, { message: "Title must be at most 80 characters" })
    .default("Untitled Quiz"),
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
  quiz?: QuizWithQuestions;
  isEdit?: boolean;
};

// Reusable default question constant
const DEFAULT_QUESTION = {
  text: "Sample Question",
  type: "multiple_choice" as const,
  timer: undefined,
  points: 1,
  choices: [
    { text: "Choice 1", isCorrect: false },
    { text: "Choice 2", isCorrect: true },
  ],
};

export default function QuizNewEditForm({ quiz, isEdit = false }: Props) {
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
    timer: quiz?.timer || undefined,
    questions: quiz?.questions?.map((q: any) => ({
      text: q.text,
      type: q.type,
      timer: q.timer || undefined,
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
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

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
      return push(PATH_DASHBOARD.quiz.view(quiz.id));
    }

    formData.append("userId", user.id || "");
    startTransition(() => {
      newAction(formData);
    });
  };

  const handleBack = () => {
    if (isEdit && quiz) {
      return push(PATH_DASHBOARD.quiz.view(quiz.id));
      
    }
    push(PATH_DASHBOARD.library.root);
  };

  useEffect(() => {
    if (newState.quizId && !isNewPending) {
      push(PATH_DASHBOARD.quiz.view(newState.quizId));
    }
  }, [newState.quizId, isNewPending, push]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form Header */}
        <QuizNewEditHeader
          isPending={isSavePending || isNewPending}
          onBack={handleBack}
          saveState={saveState}
          newState={newState}
          title={titleValue}
        />

        {/* Quiz Title is now in the navbar, so we can remove the title field below */}
        {/* Questions Section */}
        <div className="space-y-4 p-4">
          <div className="flex w-full justify-between">
            <h2 className="text-xl font-bold">Questions</h2>
            <div className="pr-11">
              <QuizNewEditQuestionDialog
                onSave={(newQuestionData) => {
                  const completeQuestion = {
                    ...DEFAULT_QUESTION,
                    text: newQuestionData.text,
                    choices: newQuestionData.choices,
                  };
                  appendQuestion(completeQuestion);
                }}
                triggerText="Add new question"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {questionFields.map((field, index) => (
              <div key={field.id} className="flex flex-row gap-2">
                <QuestionCard
                  questionIndex={index}
                  question={field}
                  quizHasIndividualTimers={true}
                  onUpdate={(updatedQuestion) => {
                    updateQuestion(index, updatedQuestion);
                  }}
                  onDelete={() => removeQuestion(index)}
                />
                {/* Reorder Buttons Outside the Card */}
                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    variant="ghost"
                    size="icon"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === questionFields.length - 1}
                    variant="ghost"
                    size="icon"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {errors.questions && typeof errors.questions.message === "string" && (
            <p className="text-red-500 text-sm">{errors.questions.message}</p>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
