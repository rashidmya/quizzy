import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuizAttemptWithAnswers } from "@/types/quiz";

interface ParticipantsTabProps {
  attempts: any[];
  totalQuizPoints: number;
  totalQuestions: number;
}

export default function ParticipantsTab({
  attempts,
  totalQuizPoints,
  totalQuestions,
}: ParticipantsTabProps) {
  // Sort attempts by score (highest first)
  const sortedAttempts = [...attempts].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Correct Answers</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAttempts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No participants have taken this quiz yet
                </TableCell>
              </TableRow>
            ) : (
              sortedAttempts.map((attempt: QuizAttemptWithAnswers) => {
                // Calculate number of correct answers
                const correctAnswers =
                  attempt.answers?.filter((ans: any) => ans.isCorrect).length ||
                  0;

                // Calculate attempt score
                const attemptScore =
                  attempt.answers?.reduce((acc, answer) => {
                    return (
                      acc + (answer.isCorrect ? answer.questionPoints ?? 0 : 0)
                    );
                  }, 0) || 0;

                // Calculate attempt accuracy
                const attemptAccuracy =
                  totalQuizPoints > 0
                    ? (attemptScore / totalQuizPoints) * 100
                    : 0;

                // Calculate completion percentage
                const completionPercentage =
                  totalQuestions > 0
                    ? ((attempt.answers?.length || 0) / totalQuestions) * 100
                    : 0;

                return (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">
                      {attempt.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span>
                            {correctAnswers} / {totalQuestions}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {completionPercentage.toFixed(0)}% completed
                          </span>
                        </div>
                        <Progress
                          value={completionPercentage}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={
                          attemptAccuracy >= 80
                            ? "green"
                            : attemptAccuracy >= 50
                            ? "yellow"
                            : "red"
                        }
                        variant="default"
                      >
                        {attemptAccuracy.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {attemptScore} / {totalQuizPoints}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
