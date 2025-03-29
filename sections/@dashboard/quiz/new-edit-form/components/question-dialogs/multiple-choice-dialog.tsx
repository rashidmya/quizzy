"use client";

import { useState } from "react";
// react-hook-form
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
// icons
import {
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  X,
  AlertCircle,
} from "lucide-react";
// types
import { MultipleChoiceData } from "../question-cards/multiple-choice-card";

// Schema for the dialog form
const multipleChoiceSchema = z.object({
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  choices: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Choice text is required" }),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, { message: "At least two choices are required" })
    .refine((choices) => choices.some((choice) => choice.isCorrect), {
      message: "At least one choice must be marked as correct",
    }),
});

type DialogFormValues = z.infer<typeof multipleChoiceSchema>;

interface MultipleChoiceDialogProps {
  initialData: MultipleChoiceData;
  onSave: (data: DialogFormValues) => void;
  triggerText?: string;
}

export default function MultipleChoiceDialog({
  initialData,
  onSave,
  triggerText = "Edit",
}: MultipleChoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Create form instance
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<DialogFormValues>({
    resolver: zodResolver(multipleChoiceSchema),
    defaultValues: {
      text: initialData.text,
      choices: initialData.choices,
    },
    mode: "onChange",
  });

  // Field array for choices
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "choices",
  });

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      reset({
        text: initialData.text,
        choices: initialData.choices,
      });
    }
  };

  // Handle save
  const handleDialogSave = (data: DialogFormValues) => {
    onSave(data);
    setOpen(false);
  };

  // Handle drag start for choice reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over for choice reordering
  const handleDragOver = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="text-xs shadow-none" variant="outline" size="sm">
          <div className="flex items-center gap-1">
            <Pencil className="h-3.5 w-3.5" />
            {triggerText}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Multiple Choice Question
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit(handleDialogSave)(e);
          }}
          className="mt-4 flex flex-col h-full"
        >
          {/* Question Text */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="question-text" className="text-base font-medium">
              Question Text
            </Label>
            <Controller
              control={control}
              name="text"
              render={({ field }) => (
                <Textarea
                  id="question-text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter your question here..."
                  className="min-h-24 resize-none"
                />
              )}
            />
            {errors.text && (
              <p className="text-destructive text-sm">{errors.text.message}</p>
            )}
          </div>

          {/* Choices Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Answer Choices</Label>

              {errors.choices && typeof errors.choices.message === "string" && (
                <p className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.choices.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="border"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={() => handleDragOver(index)}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="cursor-move touch-none flex items-center">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <Input
                          id={`choices.${index}.text`}
                          {...register(`choices.${index}.text` as const)}
                          placeholder={`Choice ${index + 1}`}
                          className="flex-1"
                        />
                        {Array.isArray(errors.choices) &&
                          errors.choices[index]?.text && (
                            <p className="text-destructive text-xs mt-1">
                              {errors.choices[index]?.text?.message}
                            </p>
                          )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Controller
                            control={control}
                            name={`choices.${index}.isCorrect` as const}
                            render={({ field: checkboxField }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`choices.${index}.isCorrect`}
                                  checked={checkboxField.value}
                                  onCheckedChange={checkboxField.onChange}
                                  className={
                                    checkboxField.value
                                      ? "bg-green-600 border-green-600"
                                      : ""
                                  }
                                />
                                <label
                                  htmlFor={`choices.${index}.isCorrect`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  onClick={() =>
                                    checkboxField.onChange(!checkboxField.value)
                                  }
                                >
                                  Correct
                                </label>
                              </div>
                            )}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 2}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed gap-2"
                onClick={() => append({ text: "", isCorrect: false })}
              >
                <Plus className="h-4 w-4" />
                Add Choice
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={!isValid}>
              Save Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
