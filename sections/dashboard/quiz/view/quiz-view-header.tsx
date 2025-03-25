"use client";

// Icons
import { Timer, Calendar } from "lucide-react";
// Components
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatusBadge from "@/components/status-badge";
// Types
import { QuizStatus } from "@/types/quiz";
import { fDateTime } from "@/utils/format-time";

// Types
type QuizHeaderProps = {
  title: string;
  timerMode: string;
  timer?: number | null;
  status: QuizStatus;
  scheduledAt?: Date | string | null;
  endedAt?: Date | string | null;
};

// Helper function to render timer information
const renderTimerInfo = (timerMode: string, timer?: number | null) => {
  const timerModeMap = {
    none: "No Timer",
    global: "Global Timer",
    question: "Per Question Timer",
  };

  const displayMode =
    timerModeMap[timerMode as keyof typeof timerModeMap] || timerMode;

  return (
    <div className="flex items-center gap-2">
      <Timer className="h-4 w-4 text-muted-foreground" />
      <span className="capitalize">{displayMode}</span>
      {timer && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary">
                {timer / 60} {timer / 60 === 1 ? "min" : "mins"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Total quiz time allocation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default function QuizHeader({
  title,
  timerMode,
  timer,
  status,
  scheduledAt,
  endedAt,
}: QuizHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 pb-0">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {<StatusBadge status={status} />}
        </div>

        {status === "scheduled" && scheduledAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for {fDateTime(scheduledAt)}</span>
            {endedAt && <span> until {fDateTime(endedAt)}</span>}
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-0 space-y-2 text-right">
        <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
          {renderTimerInfo(timerMode, timer)}
        </div>
      </div>
    </div>
  );
}
