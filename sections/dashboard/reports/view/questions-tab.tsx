import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getQuestionTypeLabel } from "@/utils/get-question-type-label";
import { CheckCircle, XCircle, HelpCircle, Users } from "lucide-react";

interface QuestionsTabProps {
  questions: any[];
  attempts: any[];
}

export default function QuestionsTab({
  questions,
  attempts,
}: QuestionsTabProps) {
  // Function to get question analytics
  function getQuestionAnalytics(questionId: string) {
    // Total attempts for this question
    const totalAttempts = attempts.reduce((count, attempt) => {
      const hasAttempted = attempt.answers?.some(
        (ans: any) => ans.questionId === questionId
      );
      return hasAttempted ? count + 1 : count;
    }, 0);

    // Correct answers count
    const correctCount = attempts.reduce((count, attempt) => {
      const isCorrect = attempt.answers?.some(
        (ans: any) => ans.questionId === questionId && ans.isCorrect
      );
      return isCorrect ? count + 1 : count;
    }, 0);

    // Calculate accuracy percentage
    const accuracy =
      totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

    // Map of choices and how many people selected each
    const choiceSelections: Record<string, number> = {};

    attempts.forEach((attempt) => {
      attempt.answers?.forEach((ans: any) => {
        if (ans.questionId === questionId) {
          choiceSelections[ans.answer] =
            (choiceSelections[ans.answer] || 0) + 1;
        }
      });
    });

    return {
      totalAttempts,
      correctCount,
      accuracy,
      choiceSelections,
    };
  }

  // Function to get badge variant based on accuracy
  function getAccuracyBadgeProps(accuracy: number): {
    variant?:
      | "default"
      | "brand"
      | "destructive"
      | "secondary"
      | "outline"
      | null;
    className: string;
  } {
    if (accuracy >= 80) {
      return {
        variant: "default",
        className: "bg-green-500 hover:bg-green-600",
      };
    } else if (accuracy >= 50) {
      return {
        variant: "default",
        className: "bg-yellow-500 text-yellow-950 hover:bg-yellow-600",
      };
    } else {
      return { variant: "destructive", className: "" };
    }
  }

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center text-muted-foreground">
              <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
              <p className="text-lg font-medium">
                No questions found for this quiz
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Add questions to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        questions.map((question, index) => {
          const analytics = getQuestionAnalytics(question.id);
          const accuracyBadgeProps = getAccuracyBadgeProps(analytics.accuracy);

          return (
            <Card
              key={question.id}
              className="shadow-sm transition-all hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-base">
                      Question {index + 1}
                    </h3>
                    <Badge variant="outline" className="font-normal">
                      {getQuestionTypeLabel(question.type)}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {question.points} points
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              {analytics.totalAttempts}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {analytics.totalAttempts} total attempts
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Badge
                      {...accuracyBadgeProps}
                      className={`${accuracyBadgeProps.className || ""}`}
                    >
                      {analytics.accuracy.toFixed(1)}% accuracy
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <p className="mb-6 font-medium">{question.text}</p>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  {/* Choices with stats - takes 4/6 of the space */}
                  <div className="md:col-span-4 space-y-4">
                    {question.choices?.map((choice: any) => {
                      // Calculate the percentage of participants who selected this choice
                      const selectionCount =
                        analytics.choiceSelections[choice.id] || 0;
                      const selectionPercentage =
                        analytics.totalAttempts > 0
                          ? (selectionCount / analytics.totalAttempts) * 100
                          : 0;

                      return (
                        <div key={choice.id} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {choice.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}
                            <p
                              className={`${
                                choice.isCorrect ? "font-medium" : ""
                              } text-sm`}
                            >
                              {choice.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pl-6">
                            <Progress
                              value={selectionPercentage}
                              className={`h-2 ${
                                choice.isCorrect
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              }`}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {selectionPercentage.toFixed(0)}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="text-xs">
                                    {selectionCount} of{" "}
                                    {analytics.totalAttempts} selected this
                                    answer
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Question stats - takes 2/6 of the space */}
                  <div className="md:col-span-2 space-y-4 flex">
                    <div className="hidden md:flex justify-center h-full mx-4">
                      <Separator orientation="vertical" />
                    </div>
                    <div className="flex flex-col w-full gap-4">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Response breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Correct
                            </p>
                            <span className="text-xs text-green-600 font-medium">
                              {analytics.accuracy.toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={analytics.accuracy}
                            className="h-2 bg-gray-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              Incorrect
                            </p>
                            <span className="text-xs text-red-600 font-medium">
                              {(100 - analytics.accuracy).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={100 - analytics.accuracy}
                            className="h-2 bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
