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
import { CheckCircle, Trash2, XCircle } from "lucide-react";
// sections
import QuestionEditorDialog from "./quiz-form-question-editor-dialog";
import { useFormContext } from "react-hook-form";
import { QuestionType } from "@/types/question";
import React, { ReactNode } from "react";

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
  quizHasIndividualTimers: boolean;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: () => void;
};

export default function QuizFormQuestionCard({
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
    <Card className="shadow-sm border py-1 rounded-sm w-full">
      <CardHeader className="flex justify-between pt-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <QuestionInfo>
              <span className="text-xs capitalize">
                {question.type.replace("_", " ")}
              </span>
            </QuestionInfo>
            {quizHasIndividualTimers && (
              <QuestionInfo>
                <span className="text-xs">
                  {question.timer ? `${question.timer}s` : "No Timer"}
                </span>
              </QuestionInfo>
            )}
            <QuestionInfo>
              <span className="text-xs">
                {question.points} {question.points === 1 ? "point" : "points"}
              </span>
            </QuestionInfo>
          </div>
          <div className="flex gap-1">
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
              variant="outline"
              size="sm"
              onClick={onDelete}
            >
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
