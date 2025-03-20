"use client";

import { useEffect, useState } from "react";

interface QuizTimerProps {
  attempt: { startedAt: Date };
  totalTime: number | null;
  timerMode: string;
  onTimeUp?: () => void;
}

export default function QuizTakingTimer({
  timerMode,
  attempt,
  totalTime,
  onTimeUp,
}: QuizTimerProps) {
  if (timerMode !== "global") {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (totalTime) {
      const updateTimer = () => {
        const startedTime = new Date(attempt.startedAt).getTime();
        const now = Date.now();
        const secondsPassed = Math.floor((now - startedTime) / 1000);
        const remaining = totalTime - secondsPassed;
        setTimeLeft(remaining > 0 ? remaining : 0);
        if (remaining <= 0 && onTimeUp) {
          onTimeUp();
        }
      };

      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [attempt, totalTime, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="text-lg font-mono">
      {timeLeft && timeLeft > 0 ? formatTime(timeLeft) : "Time's up!"}
    </div>
  );
}
