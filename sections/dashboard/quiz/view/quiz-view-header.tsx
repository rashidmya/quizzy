"use client";

// Icons
import { Timer } from "lucide-react";
// Components
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type QuizHeaderProps = {
  title: string;
  timerMode: string;
  timer?: number | null;
  isLive: boolean;
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
  isLive,
}: QuizHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 pb-0">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <Badge
            variant={isLive ? "default" : "outline"}
            className={
              isLive
                ? "animate-pulse"
                : "text-muted-foreground border-muted-foreground"
            }
          >
            {isLive ? "Live" : "Offline"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 space-y-2 text-right">
        <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
          {renderTimerInfo(timerMode, timer)}
        </div>
      </div>
    </div>
  );
}
