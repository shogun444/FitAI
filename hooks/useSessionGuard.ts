import { useGlobalRestTimer } from "@/contexts/RestTimerContext";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { useWorkoutStore } from "@/store";

/**
 * Session Guard Hook
 *
 * Enforces the critical product invariant:
 * THERE MUST BE ONLY ONE ACTIVE WORKOUT SESSION AT ANY TIME.
 *
 * This hook provides a unified way to:
 * 1. Check if ANY workout session is currently active (free OR paid)
 * 2. Cancel the active session safely
 *
 * Active sessions:
 * - Free workout: `currentWorkout !== null` in Zustand
 * - Paid program: `sessionStatus === "in_progress"` with `currentSession !== null`
 */

export type ActiveSessionType = "free" | "program" | null;

export interface SessionGuardState {
  /** Whether a workout session is currently in progress */
  hasActiveSession: boolean;
  /** Type of the active session (null if none) */
  activeSessionType: ActiveSessionType;
  /** Cancel the current active session (clears all state, does NOT save to history) */
  cancelActiveSession: () => Promise<void>;
}

export function useSessionGuard(): SessionGuardState {
  const { currentWorkout, cancelWorkout } = useWorkoutStore();
  const { timer: globalRestTimer } = useGlobalRestTimer();
  const { hasSessionInProgress, cancelSession } = useProgramInstance();

  // Check for active free workout
  const hasFreeWorkout = currentWorkout !== null;

  // Check for active paid program session
  const hasProgramSession = hasSessionInProgress;

  // Any active session?
  const hasActiveSession = hasFreeWorkout || hasProgramSession;

  // Determine the type of active session (free takes priority for messaging)
  const activeSessionType: ActiveSessionType = hasFreeWorkout
    ? "free"
    : hasProgramSession
      ? "program"
      : null;

  /**
   * Cancel the active session.
   * This clears all state and does NOT save to history.
   */
  const cancelActiveSession = async (): Promise<void> => {
    // Reset the global rest timer first
    globalRestTimer.reset();

    if (hasFreeWorkout) {
      // Cancel free workout (clears currentWorkout, Zustand timer, etc.)
      cancelWorkout();
    }

    if (hasProgramSession) {
      // Cancel paid program session
      await cancelSession();
    }
  };

  return {
    hasActiveSession,
    activeSessionType,
    cancelActiveSession,
  };
}
