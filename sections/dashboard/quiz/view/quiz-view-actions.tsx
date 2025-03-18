"use client";

// lucide icons
import {
  PlayCircle,
  StopCircle,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  Trash2,
  Loader,
  Share2Icon,
  Copy,
} from "lucide-react";
// components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// sonner
import { toast } from "sonner";

type QuizMainActionsProps = {
  isLive: boolean;
  isSetLivePending: boolean;
  onToggleLive: () => void;
  onSchedule: () => void;
};

export function QuizMainActions({
  isLive,
  isSetLivePending,
  onToggleLive,
  onSchedule,
}: QuizMainActionsProps) {
  return (
    <div className="flex flex-row gap-2">
      <Button
        className="rounded flex-2 h-14"
        variant="default"
        size="lg"
        onClick={onToggleLive}
      >
        {isSetLivePending ? (
          <Loader className="!h-4 !w-4 animate-spin" />
        ) : isLive ? (
          <>
            <StopCircle className="!h-4 !w-4" />
            <span>Stop Live</span>
          </>
        ) : (
          <>
            <PlayCircle className="!h-4 !w-4" />
            <span>Go Live</span>
          </>
        )}
      </Button>
      <Button
        className="rounded flex-1 h-14"
        variant="default"
        size="sm"
        onClick={onSchedule}
      >
        <Calendar className="h-4 w-4" />
        <span>Schedule</span>
      </Button>
    </div>
  );
}

type QuizAltActionsProps = {
  quizUrl: string;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function QuizAltActions({
  quizUrl,
  onPreview,
  onEdit,
  onDelete,
}: QuizAltActionsProps) {
  return (
    <div className="gap-2 items-center flex">
      <Button
        className="rounded"
        variant="secondary"
        size="sm"
        onClick={onPreview}
      >
        <Eye className="h-4 w-4" />
        <span>Preview</span>
      </Button>
      <ShareDialog quizUrl={quizUrl} />
      <Button
        className="rounded"
        variant="secondary"
        size="sm"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4" />
        <span>Edit</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded" variant="secondary" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShareDialog({ quizUrl }: { quizUrl: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded" variant="secondary" size="sm">
          <Share2Icon />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to take the quiz.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={quizUrl} readOnly />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={() => {
              const input = document.getElementById("link") as HTMLInputElement;
              if (input) {
                navigator.clipboard.writeText(input.value).then(() => {
                  toast.info("Link copied");
                });
              }
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy />
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
