import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle } from "lucide-react";

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

  // Format question type for display
  function formatQuestionType(type: string) {
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  return (
    <div className="space-y-8">
      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No questions found for this quiz
        </div>
      ) : (
        questions.map((question, index) => {
          const analytics = getQuestionAnalytics(question.id);

          return (
            <div key={question.id} className="rounded-md border p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    Question {index + 1}
                  </h3>
                  <Badge variant="outline">
                    {formatQuestionType(question.type)}
                  </Badge>
                  <Badge>{question.points} points</Badge>
                </div>
                <Badge
                  color={
                    analytics.accuracy >= 80
                      ? "green"
                      : analytics.accuracy >= 50
                      ? "yellow"
                      : "red"
                  }
                  variant={
                    analytics.accuracy >= 80
                      ? "default"
                      : analytics.accuracy >= 50
                      ? "brand"
                      : "destructive"
                  }
                >
                  {analytics.accuracy.toFixed(1)}% accuracy
                </Badge>
              </div>

              <p className="mb-4">{question.text}</p>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                {/* Choices with stats - takes 4/5 of the space */}
                <div className="md:col-span-4 space-y-3">
                  {question.choices?.map((choice: any) => {
                    // Calculate the percentage of participants who selected this choice
                    const selectionCount =
                      analytics.choiceSelections[choice.id] || 0;
                    const selectionPercentage =
                      analytics.totalAttempts > 0
                        ? (selectionCount / analytics.totalAttempts) * 100
                        : 0;

                    return (
                      <div key={choice.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          {choice.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          )}
                          <p className={choice.isCorrect ? "font-medium" : ""}>
                            {choice.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-50">
                          <Progress
                            value={selectionPercentage}
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {selectionPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical separator */}

                {/* Question stats - takes 1/5 of the space */}
                <div className="md:col-span-2 space-y-4 flex">
                  <div className="hidden md:flex justify-center h-full mx-4">
                    <Separator orientation="vertical" />
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={analytics.accuracy}
                          className="h-2 bg-gray-200"
                        />
                        <span className="text-xs text-green-600 w-12 text-right font-medium">
                          {analytics.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={100 - analytics.accuracy}
                          className="h-2 bg-gray-200"
                        />
                        <span className="text-xs text-red-600 w-12 text-right font-medium">
                          {(100 - analytics.accuracy).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
