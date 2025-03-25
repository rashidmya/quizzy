"use client";

import { Suspense } from "react";
// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// icons
import { CalendarIcon, UsersIcon, BarChart3Icon } from "lucide-react";
// sections
import StatsCards from "./report-view-stats-cards";
import ParticipantsTab from "./report-view-participants-tab";
import QuestionsTab from "./report-view-questions-tab";
// types
import { QuizAttemptWithAnswers, QuizWithQuestions } from "@/types/quiz";
// utils
import { fDate } from "@/utils/format-time";

export default function ReportView({
  quiz,
  attempts,
}: {
  quiz: QuizWithQuestions;
  attempts: QuizAttemptWithAnswers[];
}) {
  // Calculate statistics
  const totalParticipants = attempts.length;
  const totalQuestions = quiz.questions.length;
  const totalQuizPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);

  // Calculate the total points gained by all participants
  const totalPointsGained = attempts.reduce((sum, attempt) => {
    const attemptScore =
      attempt.answers?.reduce((acc, answer) => {
        return acc + (answer.isCorrect ? answer.questionPoints ?? 0 : 0);
      }, 0) || 0;
    return sum + attemptScore;
  }, 0);

  // Calculate accuracy
  const accuracy =
    totalParticipants > 0
      ? (totalPointsGained / (totalQuizPoints * totalParticipants)) * 100
      : 0;

  // Calculate completion rate
  const totalQuestionsAttempted = attempts.reduce(
    (sum, attempt) => sum + attempt.answers?.length || 0,
    0
  );
  const completionRate =
    totalParticipants > 0 && totalQuestions > 0
      ? (totalQuestionsAttempted / (totalQuestions * totalParticipants)) * 100
      : 0;

  const stats = {
    accuracy: accuracy.toFixed(1),
    completionRate: completionRate.toFixed(1),
    totalParticipants,
    totalQuestions,
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-6xl">
      <div className="rounded-lg p-6 shadow-sm border-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
                {quiz.title}
              </h1>
              <div className="flex items-center mt-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <p>Created on {fDate(quiz.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-24 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <StatsCards stats={stats} />
      </Suspense>

      <Tabs defaultValue="participants" className="w-full">
        <div className="mb-4">
          <TabsList className="w-full grid grid-cols-2 max-w-full mx-auto">
            <TabsTrigger
              value="participants"
              className="flex items-center justify-center gap-2"
            >
              <UsersIcon className="h-4 w-4" />
              <span>Participants</span>
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="flex items-center justify-center gap-2"
            >
              <BarChart3Icon className="h-4 w-4" />
              <span>Questions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="participants" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="rounded-t-lg border-b pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    Participants
                  </CardTitle>
                  <CardDescription>
                    View detailed performance by participant
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalParticipants}{" "}
                  {totalParticipants === 1 ? "participant" : "participants"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                >
                  <ParticipantsTab
                    attempts={attempts}
                    totalQuizPoints={totalQuizPoints}
                    totalQuestions={totalQuestions}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-0">
          <Card className="shadow-sm">
            <CardHeader className="rounded-t-lg border-b pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3Icon className="h-5 w-5 text-primary" />
                    Questions
                  </CardTitle>
                  <CardDescription>
                    Analyze performance by question
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalQuestions}{" "}
                  {totalQuestions === 1 ? "question" : "questions"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                >
                  <QuestionsTab
                    questions={quiz.questions}
                    attempts={attempts}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Total Points Available: {totalQuizPoints} • Questions:{" "}
          {totalQuestions}
        </p>
      </div>
    </div>
  );
}
