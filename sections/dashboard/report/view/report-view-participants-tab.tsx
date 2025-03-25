"use client";

// components
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// types
import { QuizAttemptWithAnswers } from "@/types/quiz";
// icons
import { Users, Medal, Trophy } from "lucide-react";

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
  // Helper function to calculate the score for an attempt
  const getScore = (attempt: QuizAttemptWithAnswers): number =>
    attempt.answers.reduce(
      (acc, answer) =>
        acc + (answer.isCorrect ? answer.questionPoints ?? 0 : 0),
      0
    );

  // Sort attempts by calculated score (highest first)
  const sortedAttempts = [...attempts].sort(
    (a, b) => getScore(b) - getScore(a)
  );

  // Get top performer (if any)
  const topPerformer = sortedAttempts.length > 0 ? sortedAttempts[0] : null;
  const topScore = topPerformer ? getScore(topPerformer) : 0;
  const topAccuracy =
    totalQuizPoints > 0 ? (topScore / totalQuizPoints) * 100 : 0;

  // Calculate average score
  const totalScore = sortedAttempts.reduce(
    (sum, attempt) => sum + getScore(attempt),
    0
  );

  const averageScore =
    sortedAttempts.length > 0 ? totalScore / sortedAttempts.length : 0;
  const averageAccuracy =
    totalQuizPoints > 0 ? (averageScore / totalQuizPoints) * 100 : 0;

  // Function to get initials from email
  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

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
    <div className="space-y-4">
      {sortedAttempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Top Performer Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Top Performer
              </CardTitle>
              <CardDescription>Highest scoring participant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback>
                    {getInitials(topPerformer?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{topPerformer?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-normal">
                      {topScore} / {totalQuizPoints} points
                    </Badge>
                    <Badge {...getAccuracyBadgeProps(topAccuracy)}>
                      {topAccuracy.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Statistics Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Quiz Statistics
              </CardTitle>
              <CardDescription>
                {sortedAttempts.length} participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-sm font-medium">
                      {averageScore.toFixed(1)} / {totalQuizPoints}
                    </p>
                  </div>
                  <Progress value={averageAccuracy} className="h-2" />
                  <p className="text-xs text-right text-muted-foreground mt-1">
                    {averageAccuracy.toFixed(1)}% average accuracy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Participants</CardTitle>
          <CardDescription>
            {sortedAttempts.length}{" "}
            {sortedAttempts.length === 1 ? "person has" : "people have"} taken
            this quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Participant</TableHead>
                <TableHead className="w-[30%]">Completion</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttempts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p>No participants have taken this quiz yet</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAttempts.map(
                  (attempt: QuizAttemptWithAnswers, index: number) => {
                    // Calculate number of correct answers
                    const correctAnswers =
                      attempt.answers?.filter((ans: any) => ans.isCorrect)
                        .length || 0;

                    // Calculate attempt score
                    const attemptScore =
                      attempt.answers?.reduce((acc, answer) => {
                        return (
                          acc +
                          (answer.isCorrect ? answer.questionPoints ?? 0 : 0)
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
                        ? ((attempt.answers?.length || 0) / totalQuestions) *
                          100
                        : 0;

                    const accuracyBadgeProps =
                      getAccuracyBadgeProps(attemptAccuracy);

                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {index === 0 && (
                              <Medal className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <Avatar className="h-8 w-8 bg-primary/10">
                              <AvatarFallback>
                                {getInitials(attempt.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate">
                              {attempt.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs">
                                      {correctAnswers} / {totalQuestions}{" "}
                                      questions
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      {correctAnswers} correct answers out of{" "}
                                      {totalQuestions} questions
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-xs text-muted-foreground">
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
                            variant={accuracyBadgeProps.variant || "default"}
                            className={accuracyBadgeProps.className}
                          >
                            {attemptAccuracy.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {attemptScore} / {totalQuizPoints}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
