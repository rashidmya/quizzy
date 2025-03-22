"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

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

  // Timer appearance changes based on remaining time
  const getTimerStyles = (): string => {
    if (isExpired) {
      return "text-red-600 font-bold animate-pulse";
    }
    if (timeLeft < 60) {
      return "text-red-500 animate-pulse"; // Less than a minute
    }
    if (timeLeft < 300) {
      return "text-amber-500"; // Less than 5 minutes
    }
    return "text-green-600";
  };

  const percentageLeft = (timeLeft / totalTime) * 100;

  return (
    <Card className="bg-white border-0 shadow-none transition-colors duration-300">
      <CardContent className="flex items-center">
        {isExpired ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>Time&apos;s up!</span>
          </Badge>
        ) : (
          <>
            {/* Time Display */}
            <div
              className={`text-lg font-mono font-semibold ${getTimerStyles()}`}
            >
              {formatTime(timeLeft)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
