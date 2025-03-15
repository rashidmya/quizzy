"use client";

import { Button } from "@/components/ui/button";
// lucide icons
import {
  PlayCircle,
  StopCircle,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  Trash2,
} from "lucide-react";
// shadcn dropdown components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type QuizAltActionsProps = {
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function QuizAltActions({
  onPreview,
  onEdit,
  onDelete,
}: QuizAltActionsProps) {
  return (
    <div className="flex justify-end">
      <Button
        className="rounded"
        variant="secondary"
        size="sm"
        onClick={onPreview}
      >
        <Eye className="h-4 w-4" />
        <span>Preview</span>
      </Button>
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

type QuizMainActionsProps = {
  isLive: boolean;
  onToggleLive: () => void;
  onSchedule: () => void;
};

export function QuizMainActions({
  isLive,
  onToggleLive,
  onSchedule,
}: QuizMainActionsProps) {
  return (
    <div className="flex flex-row gap-2">
      <Button
        className="rounded flex-1 h-14"
        variant="default"
        size="sm"
        onClick={onToggleLive}
      >
        {isLive ? (
          <>
            <StopCircle className="h-4 w-4" />
            <span>Stop Live</span>
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4" />
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
