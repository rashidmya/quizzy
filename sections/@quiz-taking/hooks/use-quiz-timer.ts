// sections/(quiz)/quiz-taking/hooks/use-quiz-timer.tsx
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage quiz timer functionality
 */
export function useQuizTimer(
  timerMode: string,
  totalTime: number | null,
  startedAt: Date | string | undefined,
  onTimeUpCallback: () => void
) {
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(
    startedAt ? new Date(startedAt) : null
  );

  // Start the timer with a specific start time
  const startTimer = useCallback((time: Date | string) => {
    setStartTime(new Date(time));
  }, []);

  // Time up handler
  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    onTimeUpCallback();
  }, [onTimeUpCallback]);

  // Determine if the quiz can continue based on timer
  const canContinueQuiz = useCallback(() => {
    if (isTimeUp) return false;
    
    // No timer: always can continue
    if (timerMode === "none") return true;

    // Global timer: check remaining time
    if (timerMode === "global" && startTime && totalTime) {
      const startTimeMs = startTime.getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startTimeMs) / 1000);
      return totalTime - secondsPassed > 0;
    }

    return true;
  }, [timerMode, totalTime, startTime, isTimeUp]);

  // Check timer status
  useEffect(() => {
    // Skip if no timer or already expired
    if (timerMode !== "global" || !totalTime || isTimeUp || !startTime) {
      return;
    }

    const checkTimer = () => {
      const startTimeMs = startTime.getTime();
      const now = Date.now();
      const secondsPassed = Math.floor((now - startTimeMs) / 1000);
      
      if (totalTime - secondsPassed <= 0) {
        handleTimeUp();
      }
    };

    // Initial check
    checkTimer();
    
    // Regular check
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [timerMode, totalTime, startTime, isTimeUp, handleTimeUp]);

  return { 
    isTimeUp, 
    canContinueQuiz: canContinueQuiz(), 
    startTimer, 
    handleTimeUp 
  };
}