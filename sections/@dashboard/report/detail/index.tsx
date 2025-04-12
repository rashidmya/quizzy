"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PATH_DASHBOARD } from "@/routes/paths";
import StatsCards from "./components/stats-cards";
import ParticipantsTab from "./components/participants-tab";
import QuestionsTab from "./components/questions-tab";

interface ReportDetailViewProps {
  reportData: {
    quiz: {
      id: string;
      title: string;
      createdBy: {
        id: string;
        name: string;
      };
      createdAt: Date;
    };
    stats: {
      accuracy: number;
      completionRate: number;
      totalParticipants: number;
      totalQuestions: number;
      totalPoints: number;
    };
    participants: {
      id: string;
      email: string;
      score: number;
      accuracy: number;
      attemptedQuestions: number;
    }[];
    questions: {
      id: string;
      text: string;
      type: string;
      points: number;
      answersCount: number;
      accuracy: number;
      answerDistribution: {
        text: string;
        isCorrect: boolean;
        count: number;
      }[];
    }[];
  };
}

export default function ReportDetailView({ reportData }: ReportDetailViewProps) {
  const [activeTab, setActiveTab] = useState("participants");
  const { quiz, stats, participants, questions } = reportData;

  return (
    <div className="space-y-6">
      {/* Header with back button and title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
            >
              <Link href={PATH_DASHBOARD.reports.root}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {quiz.title}
            </h1>
          </div>
          <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Created on{" "}
              {format(new Date(quiz.createdAt), "MMM d, yyyy")}
            </span>
            <span>•</span>
            <span>By {quiz.createdBy.name}</span>
          </div>
        </div>
      </div>

      {/* Stats cards section */}
      <StatsCards stats={stats} />

      {/* Tabs section */}
      <Tabs
        defaultValue="participants"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants" className="mt-0">
          <ParticipantsTab 
            participants={participants} 
            totalPoints={stats.totalPoints} 
            quizId={quiz.id}
          />
        </TabsContent>
        
        <TabsContent value="questions" className="mt-0">
          <QuestionsTab 
            questions={questions} 
            totalParticipants={stats.totalParticipants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 