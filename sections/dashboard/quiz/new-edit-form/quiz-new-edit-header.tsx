"use client";

import { useFormContext } from "react-hook-form";
// components
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// icons
import {
  ChevronLeftIcon,
  Loader2,
  Save,
  BookOpen,
  RotateCcw,
} from "lucide-react";
// sections
import QuizNewEditSettingsDialog from "./quiz-new-edit-settings-dialog";

type Props = {
  onBack: () => void;
  title: string;
  isPending: boolean;
  confirmExit?: boolean;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
};

export default function QuizNewEditHeader({
  onBack,
  title,
  isPending,
  confirmExit = false,
  onConfirmExit,
  onCancelExit,
}: Props) {
  const {
    setValue,
    formState: { isDirty },
  } = useFormContext();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value, { shouldDirty: true });
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onBack}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>

            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Quiz title"
                className="h-10 px-3 text-xl font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[300px] sm:w-[400px] bg-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              {isDirty && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      type="reset"
                      onClick={() => window.location.reload()}
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span className="sr-only">Reset Changes</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all changes</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <QuizNewEditSettingsDialog />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quiz settings</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isPending} className="gap-2">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Quiz
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save quiz and exit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Confirm Exit Dialog */}
      <AlertDialog open={confirmExit} onOpenChange={onCancelExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you exit now. Would
              you like to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelExit}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmExit}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
