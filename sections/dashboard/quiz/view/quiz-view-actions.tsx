"use client";

// Icons
import {
  PlayCircle,
  StopCircle,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  Trash2,
  Loader,
  Share2,
  Copy,
  CheckIcon,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hooks
import { useState } from "react";

// Utilities
import { toast } from "sonner";

// Types for component props
type QuizMainActionsProps = {
  isLive: boolean;
  isSetLivePending: boolean;
  onToggleLive: () => void;
  onSchedule: () => void;
};

type QuizAltActionsProps = {
  quizUrl: string;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function QuizViewMainActions({
  isLive,
  isSetLivePending,
  onToggleLive,
  onSchedule,
}: QuizMainActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        className="w-full sm:flex-[2] h-12 sm:h-14"
        variant="default"
        size="lg"
        onClick={onToggleLive}
        disabled={isSetLivePending}
      >
        {isSetLivePending ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : isLive ? (
          <>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Live
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Go Live
          </>
        )}
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-full sm:flex-1 h-12 sm:h-14"
              variant="secondary"
              size="lg"
              onClick={onSchedule}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Set up quiz schedule and time slots</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function QuizViewAltActions({
  quizUrl,
  onPreview,
  onEdit,
  onDelete,
}: QuizAltActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onPreview}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Preview Quiz</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Preview Quiz</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ShareDialog quizUrl={quizUrl} />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Quiz</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Quiz</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Quiz
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShareDialog({ quizUrl }: { quizUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl).then(() => {
      setCopied(true);
      toast.success("Quiz link copied!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share Quiz</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Share Quiz</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Quiz Link</DialogTitle>
          <DialogDescription>
            Copy and share this link with participants.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="quiz-link" className="sr-only">
              Quiz Link
            </Label>
            <Input
              id="quiz-link"
              defaultValue={quizUrl}
              readOnly
              className="w-full"
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant={copied ? "default" : "secondary"}
            onClick={handleCopyLink}
          >
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
