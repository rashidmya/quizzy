import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import StatsCards from "./stats-cards";
import ParticipantsTab from "./participants-tab";
import QuestionsTab from "./questions-tab";
import { QuizAttemptWithAnswers, QuizWithQuestions } from "@/types/quiz";

export default async function ReportView({
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
  const totalPointsGained = attempts.reduce(
    (sum, attempt) => sum + attempt.score,
    0
  );

  // Calculate accuracy
  const accuracy =
    totalParticipants > 0
      ? (totalPointsGained / (totalQuizPoints * totalParticipants)) * 100
      : 0;

  // Calculate completion rate
  // Total questions attempted by class / (Total questions × number of participants)
  // We assume a question is attempted if there's an answer for it
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
    <div className="container mx-auto py-8 space-y-6 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
        <p className="text-muted-foreground">
          Report for quiz created on{" "}
          {new Date(quiz.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Suspense fallback={<div>Loading statistics...</div>}>
        <StatsCards stats={stats} />
      </Suspense>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading participants data...</div>}>
                <ParticipantsTab
                  attempts={attempts}
                  totalQuizPoints={totalQuizPoints}
                  totalQuestions={totalQuestions}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading questions data...</div>}>
                <QuestionsTab questions={quiz.questions} attempts={attempts} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
