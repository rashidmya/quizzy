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
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" size="sm" onClick={onToggleLive}>
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
      <Button variant="outline" size="sm" onClick={onSchedule}>
        <Calendar className="h-4 w-4" />
        <span>Schedule</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onPreview}>
        <Eye className="h-4 w-4" />
        <span>Preview</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
        <span>Edit</span>
      </Button>
    </div>
  );
}
