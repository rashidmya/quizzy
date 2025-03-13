"use client";

import { useState } from "react";
// react-hook-form
import {
  useFieldArray,
  useWatch,
  useFormContext,
  FieldError,
} from "react-hook-form";
// components
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
// lucide icons
import { Plus, Delete, Pencil } from "lucide-react";

export type EditQuestionFormValues = {
  text: string;
  choices: { id?: string; text: string; isCorrect: boolean }[];
};

export interface QuestionError {
  text?: FieldError;
  timer?: FieldError;
  points?: FieldError;
  choices?: FieldError;
}

export interface QuestionEditorDialogProps {
  questionIndex: number;
  questionError?: QuestionError;
  onSave: (updatedData: EditQuestionFormValues) => void;
}

export default function QuestionEditorDialog({
  questionIndex,
  onSave,
}: QuestionEditorDialogProps) {
  const {
    getValues,
    setValue,
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const [open, setOpen] = useState(false);

  const [initialData, setInitialData] = useState<EditQuestionFormValues | null>(
    null
  );

  // Access the error for this specific question:
  const questionError = Array.isArray(errors.questions)
    ? (errors.questions[questionIndex] as QuestionError)
    : undefined;

  const {
    fields: choiceFields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices` as const,
  });

  // useWatch to keep track of current values.
  const questionText = useWatch({
    control,
    name: `questions.${questionIndex}.text`,
  });

  const choices = useWatch({
    control,
    name: `questions.${questionIndex}.choices`,
  });

  // Capture a deep copy of current values when the dialog opens.
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Deep clone using JSON to avoid referencing the same object.
      const currentData = JSON.parse(
        JSON.stringify(getValues(`questions.${questionIndex}`))
      ) as EditQuestionFormValues;
      setInitialData(currentData);
    }

    setOpen(isOpen);
  };

  const handleSave = () => {
    onSave({
      text: questionText || "",
      choices: choices || [],
    });
    setOpen(false);
  };

  const handleCancel = () => {
    // Revert the text field and use replace to revert the choices array.
    if (initialData) {
      setValue(`questions.${questionIndex}.text`, initialData.text);
      replace(initialData.choices);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"  size="sm">
        <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Question Text */}
          <div className="flex flex-col">
            <Label htmlFor={`questions.${questionIndex}.text`}>
              Question Text
            </Label>
            <Input
              id={`questions.${questionIndex}.text`}
              {...register(`questions.${questionIndex}.text` as const)}
              placeholder="Enter question text"
            />
            {questionError?.text && (
              <p className="text-red-500 text-sm">
                {questionError.text.message}
              </p>
            )}
          </div>
          {/* Choices Section */}
          <div className="space-y-2">
            <Label>Choices</Label>
            {choiceFields.map((choiceField, choiceIndex) => (
              <div key={choiceField.id} className="flex items-center gap-2">
                <Input
                  id={`questions.${questionIndex}.choices.${choiceIndex}.text`}
                  {...register(
                    `questions.${questionIndex}.choices.${choiceIndex}.text` as const
                  )}
                  placeholder={`Choice ${choiceIndex + 1}`}
                  className="flex-1"
                />
                <label className="flex items-center gap-1">
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
                  size="sm"
                  onClick={() => remove(choiceIndex)}
                >
                  <Delete className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {questionError?.choices &&
              !Array.isArray(questionError.choices) && (
                <p className="text-red-500 text-sm">
                  {questionError.choices.message}
                </p>
              )}
            {Array.isArray(questionError?.choices) &&
              questionError.choices.map((choiceError, index) => (
                <div key={index}>
                  {choiceError?.text?.message && (
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
