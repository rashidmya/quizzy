"use client";

import { useState, useEffect } from "react";
// react-hook-form
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// icons
import { Plus, Pencil, PlusIcon, Trash2, GripVertical, X, AlertCircle } from "lucide-react";
// utils
import { getQuestionTypeLabel } from "@/utils/get-question-type-label";
// contants
import { QUESTION_TYPES } from "@/constants";


// Define a schema for the question dialog form.
const questionDialogSchema = z.object({
  type: z.enum(QUESTION_TYPES).default("multiple_choice"),
  text: z.string().min(5, { message: "Question text is required (min 5 characters)" }),
  choices: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Choice text is required" }),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, { message: "At least two choices are required" })
    .refine(
      (choices) => choices.some((choice) => choice.isCorrect),
      { message: "At least one choice must be marked as correct" }
    ),
});

// Infer the form type.
export type EditQuestionFormValues = z.infer<typeof questionDialogSchema>;

// Default values for a new question.
const NEW_QUESTION_DEFAULT: EditQuestionFormValues = {
  type: "multiple_choice",
  text: "",
  choices: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
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
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<EditQuestionFormValues>({
    resolver: zodResolver(questionDialogSchema),
    defaultValues: initialData || NEW_QUESTION_DEFAULT,
    mode: "onChange",
  });

  // Manage the choices array.
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "choices",
  });

  // Watch the "type" field and form values to conditionally render UI elements
  const questionType = useWatch({ control, name: "type" });
  const formValues = watch();
  
  // Local states for UI
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("content");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // When the dialog opens, reset the form to initial data (or default).
  useEffect(() => {
    if (open) {
      reset(initialData || NEW_QUESTION_DEFAULT);
      setActiveTab("content");
    }
  }, [open, initialData, reset]);

  const handleDialogSave = (data: EditQuestionFormValues) => {
    // Validate that at least one choice is marked as correct
    const hasCorrectChoice = data.choices.some(choice => choice.isCorrect);
    
    if (!hasCorrectChoice) {
      setError("choices", { 
        type: "manual", 
        message: "At least one choice must be marked as correct" 
      });
      return;
    }
    
    onSave(data);
    setOpen(false);
  };

  const handleDialogCancel = () => {
    // If changes were made, confirm before closing
    if (isDirty && fields.some(field => field.text)) {
      if (window.confirm("Discard changes to this question?")) {
        reset(initialData || NEW_QUESTION_DEFAULT);
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
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

  // Function to check if any choices have validation errors
  const hasChoiceErrors = errors.choices && (
    Array.isArray(errors.choices) || 
    errors.choices.message || 
    errors.choices.root
  );

  // Count valid choices for validation messaging
  const validChoicesCount = formValues.choices.filter(choice => choice.text.trim().length > 0).length;
  const correctChoicesCount = formValues.choices.filter(choice => choice.isCorrect).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogTrigger asChild>
        {initialData ? (
          <Button 
            className="text-xs shadow-none" 
            variant="outline" 
            size="sm"
            id={`edit-dialog-btn-${initialData.text.substring(0, 10)}`}
          >
            <div className="flex items-center gap-1">
              <Pencil className="h-3.5 w-3.5" />
              {triggerText}
            </div>
          </Button>
        ) : (
          <Button 
            variant={fields.length === 0 ? "default" : "outline"} 
            size="sm" 
            className="shadow-none gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent 
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-w-3xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogDescription>
            Fill in the question details and answer choices below
          </DialogDescription>
        </DialogHeader>
        
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit(handleDialogSave)(e);
          }}
          className="mt-4 flex flex-col h-full overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="content" className="flex items-center gap-1">
                Content
                {(errors.text || hasChoiceErrors) && (
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 overflow-y-auto max-h-[60vh] pr-2">
              <TabsContent value="content" className="mt-0 space-y-6 overflow-visible">
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
                        placeholder="Enter your question here..."
                        className="min-h-24 resize-none"
                      />
                    )}
                  />
                  {errors.text && (
                    <p className="text-destructive text-sm">
                      {errors.text.message}
                    </p>
                  )}
                </div>

                {/* Choices Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Answer Choices</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`${validChoicesCount < 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {validChoicesCount} valid {validChoicesCount === 1 ? 'choice' : 'choices'}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className={`${correctChoicesCount === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {correctChoicesCount} {correctChoicesCount === 1 ? 'correct answer' : 'correct answers'}
                      </span>
                    </div>
                  </div>
                  
                  {errors.choices && typeof errors.choices.message === 'string' && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errors.choices.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <Card 
                        key={field.id}
                        className={`border ${field.isCorrect ? 'border-green-300 dark:border-green-700' : ''}`}
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
                              {Array.isArray(errors.choices) && errors.choices[index]?.text && (
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
                                        className={field.isCorrect ? "bg-green-600 border-green-600" : ""}
                                      />
                                      <label
                                        htmlFor={`choices.${index}.isCorrect`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        onClick={() => checkboxField.onChange(!checkboxField.value)}
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
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0 space-y-6">
                {/* Question Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="question-type" className="text-base font-medium">
                    Question Type
                  </Label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="question-type" className="w-full">
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
                
                {/* Future settings could go here */}
                <div className="p-4 border rounded-md bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    More question types and settings will be available in future updates.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter className="mt-6 flex items-center justify-between gap-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {!isValid && Object.keys(errors).length > 0 && (
                <span className="text-destructive">
                  Please fix all errors before saving
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleDialogCancel}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid}>Save Question</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}