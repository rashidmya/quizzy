"use client";

// components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// lucide icons
import { Trash2 } from "lucide-react";
// sections
import QuestionEditorDialog from "./question-editor-dialog";

export type QuestionCardData = {
  id: string;
  type: "open_ended" | "multiple_choice";
  text: string;
  timer?: number;
  points: number;
};

export type QuestionCardProps = {
  questionIndex: number;
  questionError?: any;
  question: QuestionCardData;
  quizHasIndividualTimers: boolean;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: () => void;
};

export default function QuestionCard({
  questionIndex,
  question,
  questionError,
  quizHasIndividualTimers,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  return (
    <Card className="shadow-sm border rounded p-4">
      <CardHeader className="flex justify-between items-center">
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
        <QuestionEditorDialog
          questionIndex={questionIndex}
          questionError={questionError}
          onSave={(updatedData) => {
            const updatedQuestion = {
              ...question,
              text: updatedData.text,
              // Optionally update additional fields if necessary
            };
            onUpdate(updatedQuestion);
          }}
        />
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
