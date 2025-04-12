"use client";

import { useState } from "react";
// react-hook-form
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
// icons
import { Pencil, AlertCircle, HelpCircle } from "lucide-react";
// types
import { FillInBlankData } from "../question-cards/fill-in-blank-card";

// Schema for the dialog form
const fillInBlankSchema = z.object({
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" })
    .regex(/_+/, {
      message:
        "Question must include a blank (use underscores '_' for the blank)",
    }),
  correctAnswer: z.string().min(1, { message: "Correct answer is required" }),
  acceptedAnswers: z.string().optional(),
});

type DialogFormValues = z.infer<typeof fillInBlankSchema>;

interface FillInBlankDialogProps {
  initialData: FillInBlankData;
  onSave: (data: DialogFormValues) => void;
  triggerText?: string;
}

export default function FillInBlankDialog({
  initialData,
  onSave,
  triggerText = "Edit",
}: FillInBlankDialogProps) {
  const [open, setOpen] = useState(false);

  // Create form instance
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<DialogFormValues>({
    resolver: zodResolver(fillInBlankSchema),
    defaultValues: {
      text: initialData.text,
      correctAnswer: initialData.correctAnswer,
      acceptedAnswers: initialData.acceptedAnswers || "",
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
        acceptedAnswers: initialData.acceptedAnswers || "",
      });
    }
  };

  // Handle save
  const handleDialogSave = (data: DialogFormValues) => {
    onSave(data);
    setOpen(false);
  };

  // Watch the question text to format it
  const questionText = watch("text");
  const formattedText = questionText
    ? questionText.replace(
        /_+/g,
        '<span class="bg-primary/20 px-1 rounded mx-1">_______</span>'
      )
    : "";

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
            Edit Fill in the Blank Question
          </DialogTitle>
          <DialogDescription>
            Create a question with a blank space that students need to fill in
          </DialogDescription>
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
            <div className="flex items-center mb-2 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>Use underscores (_) to indicate the blank space</span>
            </div>
            <Controller
              control={control}
              name="text"
              render={({ field }) => (
                <Textarea
                  id="question-text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="The largest planet in our solar system is _______."
                  className="min-h-24 resize-none"
                />
              )}
            />
            {errors.text && (
              <p className="text-destructive text-sm">{errors.text.message}</p>
            )}
          </div>

          {/* Preview */}
          {questionText && !errors.text && (
            <div className="border rounded-md p-3 bg-muted/20">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: formattedText }}
              />
            </div>
          )}

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct-answer" className="text-base font-medium">
              Correct Answer
            </Label>
            <Controller
              control={control}
              name="correctAnswer"
              defaultValue=""
              render={({ field }) => (
                <Input
                  id="correct-answer"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter the correct answer"
                />
              )}
            />
            {errors.correctAnswer && (
              <p className="text-destructive text-sm">
                {errors.correctAnswer.message}
              </p>
            )}
          </div>

          {/* Alternative Accepted Answers */}
          <div className="space-y-2">
            <Label htmlFor="accepted-answers" className="text-base font-medium">
              Alternative Accepted Answers (Optional)
            </Label>
            <div className="flex items-center mb-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Separate multiple answers with commas</span>
            </div>
            <Controller
              control={control}
              name="acceptedAnswers"
              render={({ field }) => (
                <Input
                  id="accepted-answers"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="jupiter,JUPITER,Jupiter"
                />
              )}
            />
            <Alert className="bg-muted/50">
              <AlertDescription className="text-xs">
                Students will get full points if they enter the correct answer
                or any of the alternatives. This is useful for handling
                variations in spelling, capitalization, or wording.
              </AlertDescription>
            </Alert>
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
