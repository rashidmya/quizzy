// sections/dashboard/quiz/view/components/quiz-restart-button.tsx
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useActionState } from "@/hooks/use-action-state";
import { resetQuiz } from "@/actions/quiz/quiz-management";

interface QuizRestartDialogProps {
  quizId: string;
  onSuccess?: () => void;
}

export default function QuizRestartDialog({
  quizId,
  onSuccess,
}: QuizRestartDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [_, resetAction, isResetting] = useActionState(resetQuiz, {
    message: "",
    error: false,
  });
  const router = useRouter();

  const handleRestart = async () => {
    const promise = resetAction({ quizId }).then((result) => {
      if (result.error) {
        throw new Error(result.message);
      }
      return result;
    });

    toast.promise(promise, {
      loading: "Resetting quiz...",
      success: (result) => {
        setIsDialogOpen(false);
        if (onSuccess) onSuccess();
        router.refresh();
        return result.message;
      },
      error: (err) => err.message || "Failed to reset quiz",
    });
  };

  return (
    <>
      <Button
        className="gap-2"
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
      >
        <RefreshCw className="h-4 w-4" />
        Restart Quiz
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the quiz to draft status and delete all participant
              responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestart}
              className="bg-amber-600 text-white hover:bg-amber-700"
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Yes, restart quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}