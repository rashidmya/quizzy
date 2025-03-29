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
  MessageSquare,
  FileText,
} from "lucide-react";
// sections
import OpenEndedDialog from "../question-dialogs/open-ended-dialog";

export type OpenEndedData = {
  id?: string;
  type: "open_ended";
  text: string;
  timer?: number;
  points: number;
  guidelines?: string;
};

export type OpenEndedCardProps = {
  questionIndex: number;
  question: OpenEndedData;
  timerMode: string;
  onUpdate: (updatedQuestion: OpenEndedData) => void;
  onDelete: () => void;
  onDuplicate: (questionData: OpenEndedData) => void;
};

export default function OpenEndedCard({
  questionIndex,
  question,
  timerMode,
  onUpdate,
  onDelete,
  onDuplicate,
}: OpenEndedCardProps) {
  const [isHovering, setIsHovering] = useState(false);

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
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">Open Ended</span>
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
        <CardTitle className="text-base font-medium line-clamp-2 pr-12">
          {question.text}
        </CardTitle>

        <div className="mt-3 space-y-2">
          {question.guidelines && (
            <div className="bg-muted/30 p-3 rounded-md border">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  Response Guidelines
                </p>
              </div>
              <p className="text-sm whitespace-pre-line">
                {question.guidelines}
              </p>
            </div>
          )}

          <div className="border border-dashed rounded-md p-3 bg-muted/20 text-muted-foreground text-center text-sm">
            <p>Open response area</p>
            <p className="text-xs">
              Participants will provide a free-form answer
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {question.guidelines ? "With guidelines" : "No guidelines"}
        </div>

        <OpenEndedDialog
          initialData={question}
          onSave={(updatedData) => {
            // Merge the updated data with the original question
            const updatedQuestion: OpenEndedData = {
              ...question,
              text: updatedData.text,
              guidelines: updatedData.guidelines,
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
