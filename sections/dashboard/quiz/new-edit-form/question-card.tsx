"use client";

import { UseFormReturn } from "react-hook-form";
// components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"; // components
import { Button } from "@/components/ui/button"; // components
// icons
import { Trash2 } from "lucide-react";
// sections
import QuestionEditorDialog from "./question-editor-dialog";

export type QuestionCardData = {
  id: string;
  type: "open_ended" | "multiple_choice";
  text: string;
  timer?: number;
  points: number;
  // choices are managed in the dialog (and in the parent form)
};

export type QuestionCardProps = {
  questionIndex: number;
  question: QuestionCardData;
  quizHasIndividualTimers: boolean;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: (questionId: string) => void;
  control: UseFormReturn<any>["control"];
  register: UseFormReturn<any>["register"];
};

export default function QuestionCard({
  control,
  register,
  questionIndex,
  question,
  quizHasIndividualTimers,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  return (
    <Card className="shadow-sm border rounded p-4">
      <CardHeader className="flex justify-between items-center">
        {/* Left: Display question type, timer, and points */}
        <div className="flex items-center gap-2">
          <div className="border p-1 rounded">
            <span className="text-xs font-bold capitalize">
              {question.type.replace("_", " ")}
            </span>
          </div>
          {quizHasIndividualTimers && (
            <div className="border p-1 rounded">
              <span className="text-xs font-bold">
                {question.timer ? `${question.timer}s` : "No Timer"}
              </span>
            </div>
          )}
          <div className="border p-1 rounded">
            <span className="text-xs font-bold">
              {question.points} {question.points === 1 ? "pt" : "pts"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="font-semibold">{question.text}</CardTitle>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {/* Edit button opens the question editor dialog */}
        <QuestionEditorDialog
          questionIndex={questionIndex}
          control={control} // now passing the actual control
          register={register} // now passing the actual register
          questionError={undefined} // if you have errors for this field, pass them accordingly
          onSave={(updatedData) => {
            const updatedQuestion: QuestionCardData = {
              ...question,
              text: updatedData.text,
              // Update additional fields if necessary (timer, points, etc.)
            };
            onUpdate(updatedQuestion);
          }}
        />

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(question.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
