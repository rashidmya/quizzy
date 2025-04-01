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

export default function QuizTakingTimer({
  timerMode,
  attempt,
  totalTime,
  onTimeUp,
}: QuizTimerProps) {
  // Always call hooks unconditionally.
  const [timeLeft, setTimeLeft] = useState<number>(totalTime ?? 0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Compute if timer should be enabled.
  const isTimerEnabled = timerMode === "global" && totalTime !== null;

  // Format seconds into MM:SS display
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Timer effect runs only if timer is enabled.
  useEffect(() => {
    if (!isTimerEnabled) return;

    const updateTimer = (): void => {
      const startedTime = new Date(attempt.startedAt).getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startedTime) / 1000);
      const remaining = (totalTime as number) - secondsPassed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        onTimeUp?.();
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt, totalTime, onTimeUp, isTimerEnabled]);

  // If the timer is not enabled, render nothing.
  if (!isTimerEnabled) return null;

  // Calculate percentage of time remaining.
  const percentageLeft = (timeLeft / (totalTime as number)) * 100;

  // Get appropriate color based on time left.
  const getTimeColor = (): string => {
    if (isExpired) return "text-red-600";
    if (timeLeft < 60) return "text-red-600"; // Less than a minute.
    if (timeLeft < 300) return "text-amber-600"; // Less than 5 minutes.
    return "text-green-600";
  };

  // Get badge variant based on time left.
  const getBadgeVariant = ():
    | "default"
    | "outline"
    | "destructive"
    | "secondary" => {
    if (isExpired) return "destructive";
    if (timeLeft < 60) return "destructive"; // Less than a minute.
    if (timeLeft < 300) return "secondary"; // Less than 5 minutes.
    return "outline";
  };

  return (
    <div className="flex items-center gap-2">
      {isExpired ? (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>Time&apos;s up!</span>
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
