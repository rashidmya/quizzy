"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// components
import { Card, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// sections
import QuizQuestionList from "@/sections/dashboard/quiz/view/quiz-question-list";
import { QuizHeader } from "./quiz-header";
import { QuizActions } from "./quiz-actions";
// types
import { QuizWithQuestions } from "@/types/quiz";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

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
  const { push } = useRouter();

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
    push(PATH_DASHBOARD.quiz.edit(quiz.id));
  };

  return (
    <>
      <Card className="mx-auto shadow-none border-none">
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
            <TabsList className="h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground">
              {tabs.map((tab) => (
                <TabsTrigger
                  className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  key={tab.value}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardFooter>
      </Card>
      {/* Tab content rendered below the card */}
      <div className="mx-auto mt-4">
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
