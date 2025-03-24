"use client";

import { ReactNode, useState } from "react";
// react-hook-form
import { useFormContext } from "react-hook-form";
// components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// lucide icons
import {
  CheckCircle,
  Trash2,
  XCircle,
  Clock,
  Award,
  Copy,
  MoreHorizontal,
} from "lucide-react";
// sections
import QuizNewEditQuestionDialog from "./quiz-new-edit-question-dialog";
// types
import { QuestionType } from "@/types/quiz";

export type QuestionCardData = {
  id?: string;
  type: QuestionType;
  choices: { id?: string; text: string; isCorrect: boolean }[];
  text: string;
  timer?: number;
  points: number;
};

export type QuestionCardProps = {
  questionIndex: number;
  question: QuestionCardData;
  timerMode: string;
  onUpdate: (updatedQuestion: QuestionCardData) => void;
  onDelete: () => void;
  onDuplicate: (questionData: QuestionCardData) => void;
};

export default function QuizNewEditQuestionCard({
  questionIndex,
  question,
  timerMode,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const {
    formState: { errors },
  } = useFormContext();

  const questionError = Array.isArray(errors.questions)
    ? errors.questions[questionIndex]
    : undefined;

  // Handle duplication of question
  const handleDuplicate = () => {
    onDuplicate(question);
  };

  // Track correct/incorrect answers count for display
  const correctCount = question.choices.filter((c) => c.isCorrect).length;
  const totalChoices = question.choices.length;

  return (
    <Card
      className={`shadow-sm border transition-all duration-200 w-full
        ${isHovering ? "border-primary/50 shadow-md" : ""} 
        ${questionError ? "border-destructive/50" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-7 w-7 rounded-full flex items-center justify-center p-0 font-semibold"
          >
            {questionIndex + 1}
          </Badge>
          <div className="flex flex-wrap gap-2 items-center">
            <QuestionInfo>
              <span className="text-xs capitalize">
                {question.type.replace("_", " ")}
              </span>
            </QuestionInfo>

            {timerMode === "question" && (
              <Select
                value={question.timer ? question.timer.toString() : "300"}
                onValueChange={(value) => {
                  const seconds = Number(value);
                  onUpdate({ ...question, timer: seconds });
                }}
              >
                <SelectTrigger className="h-6 text-xs rounded justify-center gap-1 w-32 bg-amber-50 dark:bg-amber-950/30">
                  <Clock className="h-3 w-3" />
                  <SelectValue placeholder="Select timer" />
                </SelectTrigger>
                <SelectContent>
                  {[60, 120, 180, 240, 300, 600, 900, 1200, 1800, 3600].map(
                    (seconds) => (
                      <SelectItem key={seconds} value={seconds.toString()}>
                        {seconds >= 60
                          ? `${Math.floor(seconds / 60)} min${
                              seconds >= 120 ? "s" : ""
                            }`
                          : `${seconds} sec`}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}

            <Select
              value={question.points ? question.points.toString() : "1"}
              onValueChange={(value) => {
                const points = Number(value);
                onUpdate({ ...question, points });
              }}
            >
              <SelectTrigger className="h-6 text-xs rounded justify-center gap-1 w-28 bg-blue-50 dark:bg-blue-950/30">
                <Award className="h-3 w-3" />
                <SelectValue placeholder="Select points" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "point" : "points"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-56 p-2">
              <div className="grid gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 h-9"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4" />
                  <span>Duplicate Question</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 text-destructive hover:text-destructive h-9"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Question</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <CardTitle className="text-base font-medium line-clamp-2 pr-12">
          {question.text}
        </CardTitle>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Answer choices
            </p>
            <Badge variant="outline" className="text-xs">
              {correctCount}/{totalChoices} correct
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.choices.slice(0, 4).map((choice, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm
                  ${
                    choice.isCorrect
                      ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                      : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                  }`}
              >
                {choice.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
                <span className="truncate">{choice.text}</span>
              </div>
            ))}
            {question.choices.length > 4 && (
              <div className="col-span-full text-center text-xs text-muted-foreground mt-1">
                + {question.choices.length - 4} more choices
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
        {questionError ? (
          <div className="flex items-center text-destructive text-sm gap-1">
            <XCircle className="h-4 w-4" />
            <span>This question has errors</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {totalChoices} {totalChoices === 1 ? "choice" : "choices"}
          </div>
        )}

        <QuizNewEditQuestionDialog
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
      </CardFooter>
    </Card>
  );
}

const QuestionInfo = ({ children }: { children: ReactNode }) => (
  <div className="border rounded px-2 py-0.5 bg-muted/30">
    <span className="text-xs capitalize">{children}</span>
  </div>
);
