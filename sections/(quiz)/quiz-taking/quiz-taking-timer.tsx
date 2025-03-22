"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
 * Timer component for quiz-taking.
 * Displays remaining time as a circular progress (like a clock) and triggers a callback when time expires.
 */
export default function QuizTakingTimer({
  timerMode,
  attempt,
  totalTime,
  onTimeUp,
}: QuizTimerProps) {
  // Only render if timer is enabled.
  if (timerMode !== "global" || !totalTime) {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState<number>(totalTime);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Format seconds into MM:SS.
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Timer update effect.
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt, totalTime, onTimeUp]);

  // Get style classes based on remaining time.
  const getTimerStyles = (): string => {
    if (isExpired) {
      return "text-red-600 font-bold";
    }
    if (timeLeft < 60) {
      return "text-red-500";
    }
    if (timeLeft < 300) {
      return "text-amber-500";
    }
    return "text-green-600";
  };

  // Circular progress calculations.
  const radius = 28; // radius of the circle (in px)
  const stroke = 4; // stroke thickness
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = timeLeft / totalTime;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Card className="bg-white border-0 shadow-none max-h-[75px]">
      <div className="flex items-center justify-center transform -translate-y-3">
        <div className="relative inline-block">
          <svg height={radius * 2} width={radius * 2}>
            {/* Background circle */}
            <circle
              stroke="#e5e7eb" // Tailwind gray-200
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress circle */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className={getTimerStyles()}
            />
          </svg>
          {/* Timer text centered inside the circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isExpired ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>Time&apos;s up!</span>
              </Badge>
            ) : (
              <span className={`text-sm font-mono font-semibold ${getTimerStyles()}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
