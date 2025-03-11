"use client";
// components
import { Card, CardFooter } from "@/components/ui/card";
// sections
import QuizQuestionList from "@/sections/dashboard/quiz/view/quiz-question-list";
// types
import { useState } from "react";
import { QuizHeader } from "./quiz-header";
import { QuizActions } from "./quiz-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizWithQuestions } from "@/types/quiz";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

type QuizDashboardCardProps = {
  quiz: QuizWithQuestions;
  participantCount?: number;
};

const tabs = [
  { label: "Questions", value: "questions" },
  { label: "Feedback", value: "feedback" },
];

export default function QuizDashboardCard({
  quiz,
  participantCount = 2,
}: QuizDashboardCardProps) {
  const [isLive, setIsLive] = useState(false);
  const [currentTab, setCurrentTab] = useState("questions");

  const handleToggleLive = () => {
    setIsLive((prev) => !prev);
  };

  const handleSchedule = () => {
    // open scheduling modal
    console.log("Open scheduling modal");
  };

  const handlePreview = () => {
    // preview quiz
    console.log("Preview quiz");
  };

  const handleEdit = () => {
    // edit quiz name or details
    console.log("Edit quiz");
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <QuizHeader
          title={quiz.title}
          description={quiz.description}
          participantCount={participantCount}
          onEdit={handleEdit}
        />
        <QuizActions
          isLive={isLive}
          onToggleLive={handleToggleLive}
          onSchedule={handleSchedule}
          onPreview={handlePreview}
          onEdit={handleEdit}
        />
        <CardFooter>
          {/* Tab triggers inside card footer */}
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardFooter>
      </Card>
      {/* Tab content rendered below the card */}
      <div className="max-w-4xl mx-auto mt-4">
        {currentTab === "questions" && (
          // Render the questions tab content.
          <QuizQuestionList questions={quiz.questions} />
        )}
        {currentTab === "feedbacks" && (
          // Render dummy feedback content.
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground">
              No feedback available yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
