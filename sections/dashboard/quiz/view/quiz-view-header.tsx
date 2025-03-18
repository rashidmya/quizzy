"use client";

// components
import { CardHeader, CardTitle } from "@/components/ui/card";
// lucide-react
import { Users, Timer, TimerReset } from "lucide-react";

type QuizHeaderProps = {
  title: string;
  participantCount: number;
  timerMode: string;
  timer?: number | null;
};

export default function QuizHeader({
  title,
  participantCount,
  timerMode,
  timer,
}: QuizHeaderProps) {
  return (
    <CardHeader className="p-0">
      <div className="flex justify-between items-start">
        {/* Quiz Title */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </div>
        </div>
        {/* Participant Count */}
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
            <Timer className="h-4 w-4" />
            <div className="flex items-center">
              <span>
                Timer mode:{" "}
                <span className="capitalize">
                  {timerMode === "none"
                    ? "none"
                    : timerMode === "global"
                    ? "global"
                    : timerMode === "question"
                    ? "per question"
                    : timerMode}
                </span>
              </span>
            </div>
          </div>
          {timer && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
              <TimerReset className="h-4 w-4" />
              <div className="flex items-center">
                <span>Timer: {timer} mins</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
            <Users className="h-4 w-4" />
            <span>
              {participantCount}{" "}
              {participantCount === 1 ? "participant" : "participants"}
            </span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
