// sections/(quiz)/quiz-taking/components/quiz-taking-timer.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, AlarmClock } from "lucide-react";

interface QuizTimerProps {
  attempt: {
    startedAt: Date | string;
  };
  totalTime: number | null;
  timerMode: "global" | "none" | string;
  onTimeUp?: () => void;
}

/**
 * Timer component for quiz-taking experience
 * Displays remaining time and triggers callback when time expires
 */
export default function QuizTakingTimer({
  timerMode,
  attempt,
  totalTime,
  onTimeUp,
}: QuizTimerProps) {
  // Return null if timer isn't enabled
  if (timerMode !== "global" || !totalTime) {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState<number>(totalTime);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Format seconds into MM:SS display
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Timer effect
  useEffect(() => {
    const updateTimer = (): void => {
      const startedTime = new Date(attempt.startedAt).getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startedTime) / 1000);
      const remaining = totalTime - secondsPassed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        onTimeUp?.();
      } else {
        setTimeLeft(remaining);
      }
    };

    // Initial timer update
    updateTimer();

    // Interval updates every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt, totalTime, onTimeUp]);

  // Calculate percentage of time remaining
  const percentageLeft = (timeLeft / totalTime) * 100;

  // Get appropriate color based on time left
  const getTimeColor = (): string => {
    if (isExpired) return "text-red-600";
    if (timeLeft < 60) return "text-red-600"; // Less than a minute
    if (timeLeft < 300) return "text-amber-600"; // Less than 5 minutes
    return "text-green-600";
  };

  // Get badge variant based on time left
  const getBadgeVariant = ():
    | "default"
    | "outline"
    | "destructive"
    | "secondary" => {
    if (isExpired) return "destructive";
    if (timeLeft < 60) return "destructive"; // Less than a minute
    if (timeLeft < 300) return "secondary"; // Less than 5 minutes
    return "outline";
  };

  return (
    <div className="flex items-center gap-2">
      {isExpired ? (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>Time's up!</span>
        </Badge>
      ) : (
        <div className="flex flex-col items-end">
          <Badge variant={getBadgeVariant()} className="mb-1">
            <AlarmClock className="h-3.5 w-3.5 mr-1" />
            <span className={`font-mono font-medium ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </Badge>

          <div className="w-24 h-1.5">
            <Progress
              value={percentageLeft}
              className="h-1.5"
              // Different colors based on time left
              style={
                {
                  backgroundColor:
                    percentageLeft < 25
                      ? "rgba(239, 68, 68, 0.2)"
                      : percentageLeft < 50
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(22, 163, 74, 0.2)",
                  "--progress-background":
                    percentageLeft < 25
                      ? "rgb(239, 68, 68)"
                      : percentageLeft < 50
                      ? "rgb(245, 158, 11)"
                      : "rgb(22, 163, 74)",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
