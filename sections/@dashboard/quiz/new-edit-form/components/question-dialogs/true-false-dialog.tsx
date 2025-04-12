"use client";

import { useState } from "react";
// react-hook-form
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// icons
import { Pencil } from "lucide-react";
// types
import { TrueFalseData } from "../question-cards/true-false-card";

// Schema for the dialog form
const trueFalseSchema = z.object({
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  correctAnswer: z.boolean(),
  explanation: z.string().optional(),
});

type DialogFormValues = z.infer<typeof trueFalseSchema>;

interface TrueFalseDialogProps {
  initialData: TrueFalseData;
  onSave: (data: DialogFormValues) => void;
  triggerText?: string;
}

export default function TrueFalseDialog({
  initialData,
  onSave,
  triggerText = "Edit",
}: TrueFalseDialogProps) {
  const [open, setOpen] = useState(false);

  // Create form instance
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<DialogFormValues>({
    resolver: zodResolver(trueFalseSchema),
    defaultValues: {
      text: initialData.text,
      correctAnswer: initialData.correctAnswer,
      explanation: initialData.explanation || "",
    },
    mode: "onChange",
  });

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      reset({
        text: initialData.text,
        correctAnswer: initialData.correctAnswer,
        explanation: initialData.explanation || "",
      });
    }
  };

  // Handle save
  const handleDialogSave = (data: DialogFormValues) => {
    onSave(data);
    setOpen(false);
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

      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit True/False Question
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit(handleDialogSave)(e);
          }}
          className="mt-4 flex flex-col h-full space-y-6"
        >
          {/* Question Text */}
          <div className="space-y-2">
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
                  placeholder="Enter your true/false statement here..."
                  className="min-h-24 resize-none"
                />
              )}
            />
            {errors.text && (
              <p className="text-destructive text-sm">{errors.text.message}</p>
            )}
          </div>

          {/* Correct Answer Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Correct Answer</Label>
            <Controller
              control={control}
              name="correctAnswer"
              render={({ field }) => (
                <RadioGroup
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="cursor-pointer">
                      True
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="cursor-pointer">
                      False
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Optional Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-base font-medium">
              Explanation (Optional)
            </Label>
            <Controller
              control={control}
              name="explanation"
              render={({ field }) => (
                <Textarea
                  id="explanation"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Provide an explanation for why the answer is true or false..."
                  className="min-h-20 resize-none"
                />
              )}
            />
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
