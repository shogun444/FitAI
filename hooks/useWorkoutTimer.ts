import { useEffect, useRef, useState } from "react";

interface WorkoutTimerState {
  elapsed: number;
  isRunning: boolean;
  formattedTime: string;
}

interface UseWorkoutTimerOptions {
  startTime?: number;
  autoStart?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Hook for tracking workout duration
 * Automatically updates elapsed time while workout is in progress
 */
export function useWorkoutTimer(
  options: UseWorkoutTimerOptions = {},
): WorkoutTimerState {
  const { startTime = Date.now(), autoStart = true } = options;
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      // Calculate initial elapsed time
      setElapsed(Math.floor((Date.now() - startTime) / 1000));

      // Update every second
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, isRunning]);

  return {
    elapsed,
    isRunning,
    formattedTime: formatTime(elapsed),
  };
}
