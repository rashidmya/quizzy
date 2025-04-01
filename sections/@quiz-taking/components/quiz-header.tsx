// sections/(quiz)/quiz-taking/components/quiz-header.tsx
"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import QuizTakingTimer from "./quiz-taking-timer";

interface QuizHeaderProps {
  title: string;
  timerMode: string;
  timer: number | null;
  startedAt: Date | string;
  onTimeUp: () => void;
}

/**
 * Header component for the quiz-taking experience
 * Contains quiz title and timer
 */
export default function QuizHeader({
  title,
  timerMode,
  timer,
  startedAt,
  onTimeUp,
}: QuizHeaderProps) {
  return (
    <Card className="fixed z-50 top-0 left-0 w-full border-b border-input mb-4 transition-colors duration-300 p-0 rounded-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl transition-colors duration-300">
          {title}
        </CardTitle>
        {timerMode === "global" && (
          <QuizTakingTimer
            attempt={{ startedAt }}
            totalTime={timer}
            timerMode={timerMode}
            onTimeUp={onTimeUp}
          />
        )}
      </CardHeader>
    </Card>
  );
}
