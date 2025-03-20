"use client";

import { ReactNode } from "react";
// react-hook-form
import { Controller, useFormContext } from "react-hook-form";
// components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
// lucide icons
import { CheckCircle, Trash2, XCircle } from "lucide-react";
// sections
import QuestionNewEditQuestionDialog from "./quiz-new-edit-question-dialog";
// types
import { QuestionType } from "@/types/quiz";

export type QuestionCardData = {
  id: string;
  type: QuestionType;
  choices: { text: string; isCorrect: boolean }[];
  text: string;
  timer?: number;
  points: number;
};

export type QuestionCardProps = {
  questionIndex: number;
  question: QuestionCardData;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: () => void;
};

export default function QuizNewEditQuestionCard({
  questionIndex,
  question,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const {
    formState: { errors },
    watch,
    control,
  } = useFormContext();

  const timerMode = watch("timerMode");

  const questionError = Array.isArray(errors.questions)
    ? errors.questions[questionIndex]
    : undefined;

  return (
    <Card className="shadow-sm border py-1 rounded-sm w-full">
      <CardHeader className="flex justify-between pt-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <QuestionInfo>
              <span className="text-xs capitalize">
                {question.type.replace("_", " ")}
              </span>
            </QuestionInfo>
            {timerMode === "question" && (
              <Select
                value={question.timer ? question.timer.toString() : "1"}
                onValueChange={(value) => {
                  const minutes = Number(value);
                  // Update the react-hook-form state
                  onUpdate({ ...question, timer: minutes });
                }}
              >
                <SelectTrigger className="w-25 h-6 text-xs rounded justify-center">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 30, 45, 60].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num / 60} {question.timer === 1 ? "min" : "mins"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={question.points ? question.points.toString() : "1"}
              onValueChange={(value) => {
                const points = Number(value);
                // Update the react-hook-form state
                onUpdate({ ...question, points });
              }}
            >
              <SelectTrigger className="w-25 h-6 text-xs rounded justify-center">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {question.points === 1 ? "point" : "points"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <QuestionNewEditQuestionDialog
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

            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="font-light">{question.text}</CardTitle>
        <div className="mt-2 space-y-1">
          <p className="text-muted-foreground text-xs">Answer choices</p>
          <div className="grid grid-cols-2 gap-2">
            {question.choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                {choice.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs">{choice.text}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <div>
          {questionError && (
            <p className="text-red-500 text-sm">
              ERROR! <span className="text-xs">click edit for details</span>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

const QuestionInfo = ({ children }: { children: ReactNode }) => (
  <div className="border rounded px-2">
    <span className="text-xs capitalize">{children}</span>
  </div>
);
