"use client";

// Icons
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ListChecks,
} from "lucide-react";

// Components
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types
import { Choice, Question } from "@/types/quiz";

// Utility functions
import { getQuestionTypeLabel } from "@/utils/get-question-type-label";
import { cn } from "@/lib/utils";

// Enhanced types
type QuestionWithChoices = Omit<Question, "choices"> & {
  choices: Choice[];
};

type QuizQuestionListProps = {
  questions: QuestionWithChoices[];
};

// Question type icon mapping
const QUESTION_TYPE_ICONS = {
  "multiple-choice": ListChecks,
  "true-false": FileText,
  // Add more mappings as needed
};

function QuestionTypeIcon({ type }: { type: string }) {
  const Icon =
    QUESTION_TYPE_ICONS[type as keyof typeof QUESTION_TYPE_ICONS] || ListChecks;

  return <Icon className="h-4 w-4 text-muted-foreground" />;
}

export default function QuizQuestionList({ questions }: QuizQuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card
          key={question.id}
          className="hover:shadow-sm transition-shadow duration-300"
        >
          <CardHeader className="flex-row justify-between items-center p-4 pb-0">
            <div className="flex items-center gap-2">
              <QuestionTypeIcon type={question.type} />
              <Badge variant="secondary" className="text-xs">
                {getQuestionTypeLabel(question.type)}
              </Badge>
            </div>

            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline">
                      {question.points}{" "}
                      {question.points === 1 ? "point" : "points"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Points awarded for this question
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {question.timer && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {question.timer / 60}{" "}
                        {question.timer === 60 ? "min" : "mins"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Time allocated for this question
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <CardTitle className="text-base mb-4">
              {index + 1}. {question.text}
            </CardTitle>

            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-grow border-t border-muted-foreground/20 mr-2" />
                <span className="text-xs text-muted-foreground">
                  Answer Choices
                </span>
                <div className="flex-grow border-t border-muted-foreground/20 ml-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.choices.map((choice, choiceIndex) => (
                  <div
                    key={choiceIndex}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors",
                      choice.isCorrect
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    {choice.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{choice.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
