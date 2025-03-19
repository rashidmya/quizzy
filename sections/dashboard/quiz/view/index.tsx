"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// components
import { Card, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// sections
import QuizViewQuestionList from "./quiz-view-question-list";
import QuizViewHeader from "./quiz-view-header";
import { QuizViewAltActions, QuizViewMainActions } from "./quiz-view-actions";
import QuizViewDetails from "./quiz-view-details";
// types
import { QuizWithQuestions } from "@/types/quiz";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// hooks
import { useActionState } from "@/hooks/use-action-state";
// actions
import { setQuizLive } from "@/actions/quiz";
// sonner
import { toast } from "sonner";
// utils
import { encodeUUID } from "@/utils/encode-uuid";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

type QuizDashboardCardProps = {
  quiz: QuizWithQuestions;
  participantCount?: number;
};

const tabs = [
  { label: "Questions", value: "questions" },
  { label: "Feedback", value: "feedbacks" },
];

export default function QuizView({
  quiz,
  participantCount = 2,
}: QuizDashboardCardProps) {
  const { push } = useRouter();

  const [isLive, setIsLive] = useState(quiz.isLive);

  const [_, setLiveAction, isSetLivePending] = useActionState(setQuizLive, {
    message: "",
    error: false,
  });

  const [currentTab, setCurrentTab] = useState("questions");

  const quizUrl =
    process.env.NEXT_PUBLIC_HOSTNAME + "/q/" + encodeUUID(quiz.id);

  const handleToggleLive = async () => {
    const newLive = !isLive;

    const promise = setLiveAction({ quizId: quiz.id, isLive: newLive }).then(
      (result: any) => {
        if (result.error) {
          throw new Error(result.message);
        }
        return result;
      }
    );

    toast.promise(promise, {
      loading: newLive ? "Enabling quiz..." : "Disabling quiz...",
      success: (result) => {
        if (!result.error) {
          setIsLive(newLive);
          return newLive ? "Quiz is online" : "Quiz is offline";
        } else {
          throw new Error(result.message || "Failed to update quiz status");
        }
      },
      error: (err) => err.message || "Failed to update quiz status",
    });
  };

  const handleSchedule = () => {
    // open scheduling modal
    console.log("Open scheduling modal");
  };

  const handlePreview = () => {
    // preview quiz
    console.log("Preview quiz");
  };

  const handleDelete = () => {
    // preview quiz
    console.log("Delete quiz");
  };

  const handleEdit = () => {
    push(PATH_DASHBOARD.quiz.edit(quiz.id));
  };

  return (
    <div className="min-h-screen">
      <Card className="mx-auto shadow-none rounded px-8">
        <QuizViewHeader
          isLive={isLive}
          title={quiz.title}
          participantCount={participantCount}
          timerMode={quiz.timerMode}
          timer={quiz.timer}
        />

        <div className="flex flex-row justify-between items-center">
          <QuizViewDetails
            name={quiz.createdBy.name}
            createdAt={new Date(quiz.createdAt)}
          />

          <QuizViewAltActions
            quizUrl={quizUrl}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <QuizViewMainActions
          isLive={isLive}
          isSetLivePending={isSetLivePending}
          onSchedule={handleSchedule}
          onToggleLive={handleToggleLive}
        />

        <CardFooter>
          {/* Tab triggers inside card footer */}
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground">
              {tabs.map((tab) => (
                <TabsTrigger
                  className="text-md font-medium relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
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
      <div className="mx-auto mt-8">
        {currentTab === "questions" && (
          // Render the questions tab content.
          <QuizViewQuestionList questions={quiz.questions} />
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
    </div>
  );
}
