"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, PlusIcon, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQuestionTypeLabel, QUESTION_TYPES } from "@/types/question";

// Define a schema for the question dialog form.
const questionDialogSchema = z.object({
  type: z.enum(QUESTION_TYPES).default("multiple_choice"),
  text: z.string().min(5, { message: "Question text is required" }),
  choices: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Choice text is required" }),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(1, { message: "At least one choice is required" }),
});

// Infer the form type.
export type EditQuestionFormValues = z.infer<typeof questionDialogSchema>;

// Default values for a new question.
const NEW_QUESTION_DEFAULT: EditQuestionFormValues = {
  type: "multiple_choice",
  text: "",
  choices: [{ text: "", isCorrect: false }],
};

export interface QuestionDialogProps {
  initialData?: EditQuestionFormValues;
  onSave: (data: EditQuestionFormValues) => void;
  triggerText?: string; // e.g. "Edit" or "Add Question"
}

export default function QuizNewEditQuestionDialog({
  initialData,
  onSave,
  triggerText = "Edit",
}: QuestionDialogProps) {
  // Create a local form instance.
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditQuestionFormValues>({
    resolver: zodResolver(questionDialogSchema),
    defaultValues: initialData || NEW_QUESTION_DEFAULT,
  });

  // Manage the choices array.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "choices",
  });

  // Watch the "type" field to conditionally render the choices.
  const questionType = useWatch({ control, name: "type" });

  const [open, setOpen] = useState(false);

  // When the dialog opens, reset the form to initial data (or default).
  useEffect(() => {
    if (open) {
      reset(initialData || NEW_QUESTION_DEFAULT);
    }
  }, [open, initialData, reset]);

  const handleDialogSave = (data: EditQuestionFormValues) => {
    onSave(data);
    setOpen(false);
  };

  const handleDialogCancel = () => {
    reset(initialData || NEW_QUESTION_DEFAULT);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogTrigger asChild>
        {initialData ? (
          <Button className="text-xs shadow-none" variant="outline" size="sm">
            <div className="flex px-4">
              <Pencil className="!h-4 !w-3 mx-1" />
              {triggerText}
            </div>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="shadow-none">
            <PlusIcon className="h-4 w-4" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="h-screen min-w-screen p-6 overflow-y-auto "
      >
        <div className=" w-full max-w-[800px]  flex flex-col mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {initialData ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();

              const onInvalid = (formErrors: any) => {
                // Log errors or show a toast if needed.
                console.log(formErrors);
              };

              handleSubmit(handleDialogSave, onInvalid)(e);
            }}
            className="space-y-6 mt-6"
          >
            {/* Question Type Dropdown */}

            <div className="flex flex-row">
              {/* Question Text */}
              <div className="flex flex-col w-full mx-2">
                <Label htmlFor="question-text" className="mb-2">
                  Question Text
                </Label>
                <Input
                  id="question-text"
                  {...register("text")}
                  placeholder="Enter question text"
                  className="p-2 border rounded"
                />
                {errors.text && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.text.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="question-type" className="mb-2">
                  Question Type
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="question-type">
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((q) => (
                          <SelectItem key={q} value={q}>
                            {getQuestionTypeLabel(q)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            {/* Conditionally Render Choices for Multiple Choice */}
            {questionType === "multiple_choice" ? (
              <div className="space-y-4">
                <Label className="block mb-2">Choices</Label>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 bg-gray-50 p-3 rounded"
                  >
                    <Input
                      id={`choices.${index}.text`}
                      {...register(`choices.${index}.text` as const)}
                      placeholder={`Choice ${index + 1}`}
                      className="flex-1 p-2 border rounded"
                    />
                    <label className="flex items-center gap-1">
                      <Input
                        type="checkbox"
                        {...register(`choices.${index}.isCorrect` as const)}
                      />
                      <span className="text-sm">Correct</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="ml-2 shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.choices &&
                  (errors.choices.root ||
                    (errors.choices && !Array.isArray(errors.choices))) && (
                    <p className="text-red-500 text-sm">
                      {(errors.choices as any).root?.message ||
                        (errors.choices as any).message}
                    </p>
                  )}
                {Array.isArray(errors.choices) &&
                  errors.choices.map((choiceError, index) => (
                    <div key={index}>
                      {choiceError?.text && (
                        <p className="text-red-500 text-sm">
                          Choice {index + 1}: {choiceError.text.message}
                        </p>
                      )}
                    </div>
                  ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => append({ text: "", isCorrect: false })}
                  >
                    <Plus />
                    <span className="ml-2">Add Choice</span>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Open ended question. No choices required.
              </p>
            )}
            <DialogFooter className="pt-6">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleDialogCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
