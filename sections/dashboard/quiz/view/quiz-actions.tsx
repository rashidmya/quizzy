"use client";

import { Button } from "@/components/ui/button"; // components
import { PlayCircle, StopCircle, Calendar, Eye, Edit } from "lucide-react"; // lucide-react

type QuizActionsProps = {
  isLive: boolean;
  onToggleLive: () => void;
  onSchedule: () => void;
  onPreview: () => void;
  onEdit: () => void;
};

export function QuizActions({
  isLive,
  onToggleLive,
  onSchedule,
  onPreview,
  onEdit,
}: QuizActionsProps) {
  return (
    <div className="flex gap-2 place-items-center">
      <Button variant="default" size="sm" onClick={onToggleLive}>
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
      <Button variant="default" size="sm" onClick={onSchedule}>
        <Calendar className="h-4 w-4" />
        <span>Schedule</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={onPreview}>
        <Eye className="h-4 w-4" />
        <span>Preview</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
        <span>Edit</span>
      </Button>
    </div>
  );
}
