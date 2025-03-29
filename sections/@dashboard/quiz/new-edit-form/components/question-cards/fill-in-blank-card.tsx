"use client";

import { ReactNode, useState } from "react";
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
// icons
import {
  Trash2,
  Clock,
  Award,
  Copy,
  MoreHorizontal,
  FileInput,
  CheckCircle,
} from "lucide-react";
// sections
import FillInBlankDialog from "../question-dialogs/fill-in-blank-dialog";

export type FillInBlankData = {
  id?: string;
  type: "fill_in_blank";
  text: string;
  timer?: number;
  points: number;
  correctAnswer: string;
  acceptedAnswers?: string;
};

export type FillInBlankCardProps = {
  questionIndex: number;
  question: FillInBlankData;
  timerMode: string;
  onUpdate: (updatedQuestion: FillInBlankData) => void;
  onDelete: () => void;
  onDuplicate: (questionData: FillInBlankData) => void;
};

export default function FillInBlankCard({
  questionIndex,
  question,
  timerMode,
  onUpdate,
  onDelete,
  onDuplicate,
}: FillInBlankCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Format the text to highlight blanks
  const formattedText = question.text.replace(
    /_+/g,
    '<span class="bg-primary/20 px-1 rounded mx-1">_______</span>'
  );

  // Count number of accepted answers
  const acceptedAnswersCount = question.acceptedAnswers
    ? question.acceptedAnswers.split(",").length
    : 0;

  return (
    <Card
      className={`shadow-sm border transition-all duration-200 w-full
        ${isHovering ? "border-primary/50 shadow-md" : ""}`}
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
              <div className="flex items-center gap-1">
                <FileInput className="h-3 w-3" />
                <span className="text-xs">Fill in Blank</span>
              </div>
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
                  onClick={() => onDuplicate(question)}
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
        <CardTitle
          className="text-base font-medium line-clamp-3 pr-12"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Correct Answer
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>{question.correctAnswer}</span>
            </div>

            {acceptedAnswersCount > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Also accepted ({acceptedAnswersCount}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.acceptedAnswers?.split(",").map((answer, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-muted/30"
                    >
                      {answer.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {acceptedAnswersCount > 0
            ? `${acceptedAnswersCount + 1} accepted ${
                acceptedAnswersCount + 1 === 1 ? "answer" : "answers"
              }`
            : "Single accepted answer"}
        </div>

        <FillInBlankDialog
          initialData={question}
          onSave={(updatedData) => {
            // Merge the updated data with the original question
            const updatedQuestion: FillInBlankData = {
              ...question,
              text: updatedData.text,
              correctAnswer: updatedData.correctAnswer,
              acceptedAnswers: updatedData.acceptedAnswers,
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
  <div className="border rounded px-2 py-0.5 bg-muted/30">{children}</div>
);
