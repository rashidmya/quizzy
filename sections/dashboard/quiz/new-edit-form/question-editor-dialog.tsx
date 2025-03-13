"use client";

import { useState } from "react"; // react hooks
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // components
import { Button } from "@/components/ui/button"; // components
import { Input } from "@/components/ui/input"; // components
import { Label } from "@/components/ui/label"; // components
import { Plus, Delete } from "lucide-react"; // icons
import { useFieldArray, UseFormReturn } from "react-hook-form"; // react-hook-form

export type EditQuestionFormValues = {
  text: string;
  choices: { id?: string; text: string; isCorrect: boolean }[];
};

export interface QuestionEditorDialogProps {
  questionIndex: number;
  control: UseFormReturn<any>["control"];
  register: UseFormReturn<any>["register"];
  questionError: any; // refine as needed
  onSave: (updatedData: EditQuestionFormValues) => void;
}

export default function QuestionEditorDialog({
  questionIndex,
  control,
  register,
  questionError,
  onSave,
}: QuestionEditorDialogProps) {
  const [open, setOpen] = useState(false);

  // Manage the choices array for this particular question.
  const {
    fields: choiceFields,
    append: appendChoice,
    remove: removeChoice,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices` as const,
  });

  const handleSave = () => {
    // For this example, we call onSave without further validation.
    // In a real implementation, you might validate the updated data.
    const updatedData: EditQuestionFormValues = {
      text:
        (
          document.getElementById(
            `questions.${questionIndex}.text`
          ) as HTMLInputElement
        )?.value || "",
      choices: choiceFields.map((field, index) => ({
        text:
          (
            document.getElementById(
              `questions.${questionIndex}.choices.${index}.text`
            ) as HTMLInputElement
          )?.value || "",
        isCorrect:
          (
            document.querySelector(
              `input[name="questions.${questionIndex}.choices.${index}.isCorrect"]`
            ) as HTMLInputElement
          )?.checked || false,
      })),
    };
    onSave(updatedData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
                  onClick={() => removeChoice(choiceIndex)}
                >
                  <Delete className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {questionError?.choices &&
              typeof questionError.choices.message === "string" && (
                <p className="text-red-500 text-sm">
                  {questionError.choices.message}
                </p>
              )}
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                onClick={() => appendChoice({ text: "", isCorrect: false })}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
