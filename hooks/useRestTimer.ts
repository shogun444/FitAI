import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================
// Constants
// ============================================

const DEFAULT_REST_SECONDS = 300; // 5 minutes
const MIN_REST_SECONDS = 120; // 2 minutes
const MAX_REST_SECONDS = 420; // 7 minutes
const REST_INCREMENTS = 30; // 30 second increments

// ============================================
// Types
// ============================================

export interface RestTimerState {
  /** Configured duration in seconds */
  duration: number;
  /** Remaining time in seconds */
  remaining: number;
  /** Whether timer is currently running */
  isRunning: boolean;
  /** Whether timer has been started at least once */
  hasStarted: boolean;
}

export interface UseRestTimerReturn extends RestTimerState {
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset timer to configured duration */
  reset: () => void;
  /** Increase duration by increment (clamped to max) */
  increaseDuration: () => void;
  /** Decrease duration by increment (clamped to min) */
  decreaseDuration: () => void;
  /** Set a specific duration */
  setDuration: (seconds: number) => void;
  /** Format remaining time as MM:SS */
  formattedTime: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether timer is at minimum duration */
  isAtMinDuration: boolean;
  /** Whether timer is at maximum duration */
  isAtMaxDuration: boolean;
  /** Whether timer has completed (reached 0) */
  isComplete: boolean;
}

// ============================================
// Helpers
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function clampDuration(seconds: number): number {
  return Math.min(Math.max(seconds, MIN_REST_SECONDS), MAX_REST_SECONDS);
}

// ============================================
// Hook
// ============================================

/**
 * Centralized rest timer hook for program workouts.
 *
 * WHY THIS EXISTS:
 * - Timer state must persist when modal is dismissed
 * - Timer must be controllable from multiple UI locations
 * - Timer must NOT block UI or navigation
 *
 * ARCHITECTURE:
 * - State lives in this hook, not in any component
 * - Modal and main screen both consume this hook
 * - Timer continues running even when modal closes
 *
 * LIMITS:
 * - Default: 5:00 minutes
 * - Minimum: 2:00 minutes
 * - Maximum: 7:00 minutes
 */
export function useRestTimer(onComplete?: () => void): UseRestTimerReturn {
  const [duration, setDurationState] = useState(DEFAULT_REST_SECONDS);
  const [remaining, setRemaining] = useState(DEFAULT_REST_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick - runs independently of component lifecycle
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Call onComplete callback if provided
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, remaining]);

  const start = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(duration);
    setHasStarted(false);
  }, [duration]);

  const increaseDuration = useCallback(() => {
    const newDuration = clampDuration(duration + REST_INCREMENTS);
    setDurationState(newDuration);
    // Only update remaining if timer hasn't started
    if (!hasStarted) {
      setRemaining(newDuration);
    }
  }, [duration, hasStarted]);

  const decreaseDuration = useCallback(() => {
    const newDuration = clampDuration(duration - REST_INCREMENTS);
    setDurationState(newDuration);
    // Only update remaining if timer hasn't started
    if (!hasStarted) {
      setRemaining(newDuration);
    }
  }, [duration, hasStarted]);

  const setDuration = useCallback((seconds: number) => {
    const clamped = clampDuration(seconds);
    setDurationState(clamped);
    setRemaining(clamped);
    setHasStarted(false);
  }, []);

  const formattedTime = formatTime(remaining);
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  const isAtMinDuration = duration <= MIN_REST_SECONDS;
  const isAtMaxDuration = duration >= MAX_REST_SECONDS;
  const isComplete = hasStarted && remaining === 0;

  // Memoize return value to prevent unnecessary re-renders in consumers
  return useMemo(
    () => ({
      // State
      duration,
      remaining,
      isRunning,
      hasStarted,
      // Actions
      start,
      pause,
      reset,
      increaseDuration,
      decreaseDuration,
      setDuration,
      // Computed
      formattedTime,
      progress,
      isAtMinDuration,
      isAtMaxDuration,
      isComplete,
    }),
    [
      duration,
      remaining,
      isRunning,
      hasStarted,
      start,
      pause,
      reset,
      increaseDuration,
      decreaseDuration,
      setDuration,
      formattedTime,
      progress,
      isAtMinDuration,
      isAtMaxDuration,
      isComplete,
    ],
  );
}

// Export constants for use in components
export const REST_TIMER_DEFAULTS = {
  DEFAULT_SECONDS: DEFAULT_REST_SECONDS,
  MIN_SECONDS: MIN_REST_SECONDS,
  MAX_SECONDS: MAX_REST_SECONDS,
  INCREMENTS: REST_INCREMENTS,
};
