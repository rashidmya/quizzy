"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Components
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Custom Components
import QuizViewQuestionList from "./quiz-view-question-list";
import QuizViewHeader from "./quiz-view-header";
import { QuizViewAltActions, QuizViewMainActions } from "./quiz-view-actions";
import QuizViewDetails from "./quiz-view-details";

// Types
import { QuizWithQuestions } from "@/types/quiz";

// Paths
import { PATH_DASHBOARD } from "@/routes/paths";

// Hooks
import { useActionState } from "@/hooks/use-action-state";

// Actions
import { setQuizLive, deleteQuiz } from "@/actions/quiz/quiz-management";

// Utils
import { encodeUUID } from "@/utils/encode-uuid";

// Toasts
import { toast } from "sonner";

// Tabs configuration
const TABS = [
  { label: "Questions", value: "questions" },
  { label: "Feedback", value: "feedbacks" },
] as const;

type QuizDashboardCardProps = {
  quiz: QuizWithQuestions;
  participantCount?: number;
};

export default function QuizView({
  quiz,
  participantCount = 0,
}: QuizDashboardCardProps) {
  const { push } = useRouter();

  // State management
  const [isLive, setIsLive] = useState(quiz.isLive);
  const [currentTab, setCurrentTab] = useState<string>(TABS[0].value);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Action states
  const [_liveState, setLiveAction, isSetLivePending] = useActionState(
    setQuizLive,
    {
      message: "",
      error: false,
    }
  );

  const [_deleteState, deleteAction] = useActionState(deleteQuiz, {
    message: "",
  });

  // Quiz URL generation
  const quizUrl = `${process.env.NEXT_PUBLIC_HOSTNAME}/q/${encodeUUID(
    quiz.id
  )}`;

  // Event Handlers
  const handleToggleLive = async () => {
    const newLive = !isLive;

    const promise = setLiveAction({
      quizId: quiz.id,
      isLive: newLive,
    }).then((result: any) => {
      if (result.error) {
        throw new Error(result.message);
      }
      return result;
    });

    toast.promise(promise, {
      loading: newLive ? "Enabling quiz..." : "Disabling quiz...",
      success: (result) => {
        if (!result.error) {
          setIsLive(newLive);
          return newLive ? "Quiz is online" : "Quiz is offline";
        }
        throw new Error(result.message || "Failed to update quiz status");
      },
      error: (err) => err.message || "Failed to update quiz status",
    });
  };

  const handleSchedule = () => {
    // TODO: Implement scheduling modal/functionality
    toast.info("Scheduling feature coming soon");
  };

  const handlePreview = () => {
    // TODO: Implement quiz preview functionality
    toast.info("Preview feature coming soon");
  };

  const handleDelete = async () => {
    const result = await deleteAction(quiz.id);
    if (result.error) {
      return toast.error(result.message);
    }

    push(PATH_DASHBOARD.library.root);
    toast.success(result.message);
  };

  const handleEdit = () => {
    push(PATH_DASHBOARD.quiz.edit(quiz.id));
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <QuizViewHeader
          title={quiz.title}
          isLive={isLive}
          participantCount={participantCount}
          timerMode={quiz.timerMode}
          timer={quiz.timer}
        />

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <QuizViewDetails
              name={quiz.createdBy.name}
              createdAt={new Date(quiz.createdAt)}
            />

            <QuizViewAltActions
              quizUrl={quizUrl}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
          </div>

          <QuizViewMainActions
            isLive={isLive}
            isSetLivePending={isSetLivePending}
            onSchedule={handleSchedule}
            onToggleLive={handleToggleLive}
          />
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="border-t"
        >
          <TabsList className="w-full justify-start bg-muted/50 rounded-none">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="p-6">
              {tab.value === "questions" && (
                <QuizViewQuestionList questions={quiz.questions} />
              )}
              {tab.value === "feedbacks" && (
                <div className="text-center text-muted-foreground">
                  No feedback available yet.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              quiz and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Enforce static rendering for now
export const dynamic = "force-static";
