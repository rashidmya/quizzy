"use client";

import { useState, useEffect, useRef } from "react";
import { startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
// react-hook-form
import {
  useForm,
  useFieldArray,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// lucide icons
import { Loader2, ChevronsLeftIcon, Pencil } from "lucide-react";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// actions
import { newQuiz, saveQuiz } from "@/actions/quiz";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
// sections
import QuestionCard from "./question-card";
import QuestionEditorDialog from "./question-editor-dialog";
// types
import { QUESTION_TYPES } from "@/types/question";

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
    .min(1, { message: "Title is required" })
    .max(30, { message: "Title must be at most 30 characters" })
    .default("Untitled"),
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

// EditableQuizTitle component – toggles between a <p> and an <Input>.
function EditableQuizTitle() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<QuizFormValues>();
  const titleValue = watch("title");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if the title is invalid: empty or longer than 30 characters.
  const isInvalid = titleValue.trim() === "" || titleValue.length > 30;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    // Only exit edit mode if the title is valid.
    if (!isInvalid) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Only exit edit mode if the title is valid.
      if (!isInvalid) {
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="flex-1">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            value={titleValue}
            onChange={(e) => setValue("title", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`text-2xl font-bold ${
              isInvalid ? "border-red-500" : ""
            }`}
          />
        ) : (
          <p className="text-2xl font-bold">{titleValue || "Untitled Quiz"}</p>
        )}
        <Pencil className="h-4 w-4 text-muted-foreground my-2" />
      </div>
      {isInvalid && (
        <p className="text-red-500 text-sm">
          {titleValue.trim() === ""
            ? "Title is required."
            : titleValue.length > 30
            ? "Title must be at most 30 characters."
            : ""}
        </p>
      )}
    </div>
  );
}

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
    handleSubmit,
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

  return (
    <div className=" overflow-y-auto">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sticky Navbar with Editable Title and Save Quiz Button */}
          <div className="sticky top-0 z-50 bg-white border-b p-4 flex items-center justify-between">
            <div className="flex flex-row gap-8">
              <Button
                variant="outline"
                className="shadow-none"
                onClick={() => push(PATH_DASHBOARD.quiz.view(quiz.id))}
              >
                <ChevronsLeftIcon />
              </Button>
              <EditableQuizTitle />
            </div>
            <Button type="submit">
              {isSavePending || isNewPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span>Save Quiz</span>
              )}
            </Button>
          </div>
          {/* Quiz Title is now in the navbar, so we can remove the title field below */}
          {/* Questions Section */}
          <div className="space-y-4 p-4">
            <div className="flex w-full justify-between">
              <h2 className="text-xl font-bold">Questions</h2>
              <QuestionEditorDialog
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
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
