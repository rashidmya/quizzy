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
import { Pencil, InfoIcon } from "lucide-react";
// types
import { OpenEndedData } from "../question-cards/open-ended-card";

// Schema for the dialog form
const openEndedSchema = z.object({
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  guidelines: z.string().optional(),
});

type DialogFormValues = z.infer<typeof openEndedSchema>;

interface OpenEndedDialogProps {
  initialData: OpenEndedData;
  onSave: (data: DialogFormValues) => void;
  triggerText?: string;
}

export default function OpenEndedDialog({
  initialData,
  onSave,
  triggerText = "Edit",
}: OpenEndedDialogProps) {
  const [open, setOpen] = useState(false);

  // Create form instance
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<DialogFormValues>({
    resolver: zodResolver(openEndedSchema),
    defaultValues: {
      text: initialData.text,
      guidelines: initialData.guidelines || "",
    },
    mode: "onChange",
  });

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      reset({
        text: initialData.text,
        guidelines: initialData.guidelines || "",
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
            Edit Open-Ended Question
          </DialogTitle>
          <DialogDescription>
            Create a question that requires a long-form response
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
              Question
            </Label>
            <Controller
              control={control}
              name="text"
              render={({ field }) => (
                <Textarea
                  id="question-text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter your open-ended question here..."
                  className="min-h-24 resize-none"
                />
              )}
            />
            {errors.text && (
              <p className="text-destructive text-sm">{errors.text.message}</p>
            )}
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <Label htmlFor="guidelines" className="text-base font-medium">
              Response Guidelines (Optional)
            </Label>
            <Controller
              control={control}
              name="guidelines"
              render={({ field }) => (
                <Textarea
                  id="guidelines"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Provide guidelines for what should be included in a good response..."
                  className="min-h-32 resize-none"
                />
              )}
            />
          </div>

          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Open-ended questions will need to be manually reviewed and graded.
              The guidelines you provide here will be shown to participants and
              can also be used to assist with grading.
            </AlertDescription>
          </Alert>

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
