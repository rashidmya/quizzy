// sections/dashboard/quiz/view/quiz-detail-view.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// custom components
import QuizMetaInfo from "./components/quiz-meta-info";
import QuizQuestionsList from "./components/quiz-questions-list";
import QuizScheduleDialog from "./components/quiz-schedule-dialog";
import QuizShareDialog from "./components/quiz-share-dialog";
// icons
import {
  ArrowLeft,
  CalendarClock,
  Edit,
  Eye,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Trash2,
} from "lucide-react";
// types
import { QuizStatus, QuizWithQuestions } from "@/types/quiz";
// utils
import { fDateTime } from "@/utils/format-time";
import { encodeUUID } from "@/utils/encode-uuid";
// hooks
import { useActionState } from "@/hooks/use-action-state";
// actions
import { setQuizStatus, deleteQuiz } from "@/actions/quiz/quiz-management";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// toast
import { toast } from "sonner";
import StatusBadge from "@/components/status-badge";

interface QuizDetailViewProps {
  quiz: QuizWithQuestions;
}

export default function QuizDetailView({ quiz }: QuizDetailViewProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<QuizStatus>(
    quiz.status || "draft"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Action states
  const [_, setStatusAction, isStatusPending] = useActionState(setQuizStatus, {
    message: "",
    error: false,
  });

  const [__, deleteAction, isDeletePending] = useActionState(deleteQuiz, {
    message: "",
  });

  // URL for sharing the quiz
  const quizUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/q/${encodeUUID(quiz.id)}`
      : "";

  const handleStatusChange = async (newStatus: QuizStatus) => {
    const promise = setStatusAction({
      quizId: quiz.id,
      status: newStatus,
    }).then((result) => {
      if (result.error) {
        throw new Error(result.message);
      }
      return result;
    });

    toast.promise(promise, {
      loading: `Updating quiz status...`,
      success: (result) => {
        setCurrentStatus(newStatus);
        return result.message;
      },
      error: (err) => err.message || "Failed to update quiz status",
    });
  };

  const handleDelete = async () => {
    const promise = deleteAction(quiz.id).then((result) => {
      if (result.error) {
        throw new Error(result.message);
      }
      return result;
    });

    toast.promise(promise, {
      loading: "Deleting quiz...",
      success: (result) => {
        router.push(PATH_DASHBOARD.library.root);
        return result.message;
      },
      error: (err) => err.message || "Failed to delete quiz",
    });
  };

  const handleEdit = () => {
    router.push(PATH_DASHBOARD.quiz.edit(quiz.id));
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6 min-h-screen">
      {/* Header Card with Title and Basic Info */}
      <Card className="shadow-sm border-b-2 border-b-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <StatusBadge status={currentStatus} />
              </div>
              <p className="text-muted-foreground text-sm">
                Created by {quiz.createdBy.name} • Last updated{" "}
                {fDateTime(quiz.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit quiz details and questions
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <QuizShareDialog quizUrl={quizUrl} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* Meta Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <QuizMetaInfo quiz={quiz} status={currentStatus} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {/* Status Control Buttons */}
            {currentStatus === "draft" || currentStatus === "paused" ? (
              <Button
                className="gap-2"
                onClick={() => handleStatusChange("active")}
                disabled={isStatusPending}
              >
                <PlayCircle className="h-4 w-4" />
                Activate Quiz
              </Button>
            ) : null}

            {currentStatus === "active" ? (
              <Button
                className="gap-2"
                onClick={() => handleStatusChange("paused")}
                disabled={isStatusPending}
              >
                <PauseCircle className="h-4 w-4" />
                Pause Quiz
              </Button>
            ) : null}

            {currentStatus !== "ended" && currentStatus !== "draft" ? (
              <Button
                className="gap-2"
                onClick={() => handleStatusChange("ended")}
                variant="secondary"
                disabled={isStatusPending}
              >
                <StopCircle className="h-4 w-4" />
                End Quiz
              </Button>
            ) : null}

            {/* Always available actions */}
            <QuizScheduleDialog
              quizId={quiz.id}
              onSuccess={(newStatus) => setCurrentStatus(newStatus)}
            >
              <Button className="gap-2" variant="outline">
                <CalendarClock className="h-4 w-4" />
                Schedule Quiz
              </Button>
            </QuizScheduleDialog>

            <Button className="gap-2" variant="outline" asChild>
              <a
                href={`/q/${encodeUUID(quiz.id)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="h-4 w-4" />
                Preview Quiz
              </a>
            </Button>

            <Button
              className="gap-2 text-destructive hover:text-destructive"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuizQuestionsList questions={quiz.questions} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              quiz and all associated questions and responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletePending}
            >
              {isDeletePending ? "Deleting..." : "Delete Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
