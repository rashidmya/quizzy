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
import { useFormContext } from "react-hook-form";

export type QuestionCardData = {
  id: string;
  type: "open_ended" | "multiple_choice";
  choices: { text: string; isCorrect: boolean }[];
  text: string;
  timer?: number;
  points: number;
};

export type QuestionCardProps = {
  questionIndex: number;
  question: QuestionCardData;
  quizHasIndividualTimers: boolean;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: () => void;
};

export default function QuestionCard({
  questionIndex,
  question,
  quizHasIndividualTimers,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const questionError = Array.isArray(errors.questions)
    ? errors.questions[questionIndex]
    : undefined;

  return (
    <Card className="shadow-sm border rounded-sm p-4">
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className="border p-1 rounded">
            <span className="text-xs capitalize p-2">
              {question.type.replace("_", " ")}
            </span>
          </div>
          {quizHasIndividualTimers && (
            <div className="border p-1 rounded">
              <span className="text-xs p-2">
                {question.timer ? `${question.timer}s` : "No Timer"}
              </span>
            </div>
          )}
          <div className="border p-1 rounded">
            <span className="text-xs p-2">
              {question.points} {question.points === 1 ? "point" : "points"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="font-semibold">{question.text}</CardTitle>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <div>
          {questionError && (
            <p className="text-red-500 text-sm">
              ERROR! <span className="text-xs">click edit for details</span>
            </p>
          )}
        </div>

        <div>
          <QuestionEditorDialog
            initialData={question}
            onSave={(updatedData) => {
              // Merge the updated text and choices with the original question
              const updatedQuestion: QuestionCardData = {
                ...question,
                text: updatedData.text,
                choices: updatedData.choices,
              };
              onUpdate(updatedQuestion);
            }}
            triggerText="Edit"
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="mx-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
