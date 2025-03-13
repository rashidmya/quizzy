"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Plus, Delete, Pencil } from "lucide-react";

// Define a schema for the question dialog form.
const questionDialogSchema = z.object({
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
  text: "",
  choices: [{ text: "", isCorrect: false }],
};

export interface QuestionDialogProps {
  initialData?: EditQuestionFormValues;
  onSave: (data: EditQuestionFormValues) => void;
  triggerText?: string; // e.g. "Edit" or "Add Question"
}

export default function QuestionEditorDialog({
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

  // Optional: useWatch to keep track of current values if needed.
  // const questionText = useWatch({ control, name: "text" });
  // const choices = useWatch({ control, name: "choices" });

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
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleDialogSave)}>
          <div className="space-y-4">
            {/* Question Text */}
            <div className="flex flex-col">
              <Label htmlFor="question-text">Question Text</Label>
              <Input
                id="question-text"
                {...register("text")}
                placeholder="Enter question text"
              />
              {errors.text && (
                <p className="text-red-500 text-sm">{errors.text.message}</p>
              )}
            </div>
            {/* Choices Section */}
            <div className="space-y-2">
              <Label>Choices</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    id={`choices.${index}.text`}
                    {...register(`choices.${index}.text` as const)}
                    placeholder={`Choice ${index + 1}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-1">
                    <Input
                      type="checkbox"
                      {...register(`choices.${index}.isCorrect` as const)}
                    />
                    <span>Correct</span>
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Delete className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.choices && !Array.isArray(errors.choices) && (
                <p className="text-red-500 text-sm">
                  {(errors.choices as any).message}
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
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={() => append({ text: "", isCorrect: false })}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleDialogCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
