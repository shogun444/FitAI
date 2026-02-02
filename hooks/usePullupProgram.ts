import {
  getPullupExerciseByIndex,
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import {
  clearActiveSession,
  createDefaultProgress,
  loadActiveSession,
  loadPullupProgress,
  recordPullupSession,
  resetPullupProgress,
  saveActiveSession,
  savePullupProgress,
} from "@/lib/pullupProgramStorage";
import {
  ActivePullupSession,
  PullupProgramProgress,
  PullupSet,
} from "@/types/pullup-program";
import { useCallback, useEffect, useState } from "react";

/** Default number of sets per session */
const DEFAULT_SETS_PER_SESSION = 5;

/** Generate unique session ID */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing "Unlock Your First Pull-up" program state.
 *
 * Provides:
 * - Program progress (persisted)
 * - Active session state (in-memory)
 * - Session lifecycle: start, complete, cancel
 * - Progression logic
 */
export function usePullupProgram() {
  const [progress, setProgress] = useState<PullupProgramProgress | null>(null);
  const [activeSession, setActiveSession] =
    useState<ActivePullupSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI-only state (not persisted)
  const [inputValue, setInputValue] = useState<number | null>(null);

  // ============================================
  // Load Progress & Active Session on Mount
  // ============================================

  const refresh = useCallback(async () => {
    const [loadedProgress, loadedSession] = await Promise.all([
      loadPullupProgress(),
      loadActiveSession(),
    ]);
    setProgress(loadedProgress);
    setActiveSession(loadedSession);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ============================================
  // Derived State
  // ============================================

  const hasStarted = progress !== null;
  const isCompleted = progress?.isCompleted ?? false;
  const currentExerciseIndex = progress?.currentExerciseIndex ?? 0;
  const currentExercise = getPullupExerciseByIndex(currentExerciseIndex);

  const getCurrentExerciseProgress = useCallback(() => {
    if (!progress || !currentExercise) return null;
    return (
      progress.exerciseProgress[currentExercise.id] ?? {
        completedSessions: 0,
        sessionHistory: [],
      }
    );
  }, [progress, currentExercise]);

  const getSessionsCompleted = useCallback(() => {
    const exerciseProgress = getCurrentExerciseProgress();
    return exerciseProgress?.completedSessions ?? 0;
  }, [getCurrentExerciseProgress]);

  const getSessionsRemaining = useCallback(() => {
    if (!currentExercise) return 0;
    return currentExercise.sessionsRequired - getSessionsCompleted();
  }, [currentExercise, getSessionsCompleted]);

  // ============================================
  // Program Lifecycle
  // ============================================

  const startProgram = useCallback(async () => {
    const newProgress = createDefaultProgress();
    await savePullupProgress(newProgress);
    setProgress(newProgress);
    return newProgress;
  }, []);

  const resetProgram = useCallback(async () => {
    await resetPullupProgress();
    setProgress(null);
    setActiveSession(null);
  }, []);

  // ============================================
  // Session Lifecycle
  // ============================================

  /**
   * Start a new session. Persists immediately.
   */
  const startSession = useCallback(
    async (setsCount: number = DEFAULT_SETS_PER_SESSION) => {
      if (!currentExercise) return null;

      const session: ActivePullupSession = {
        programId: "unlock-first-pullup",
        sessionId: generateSessionId(),
        exerciseId: currentExercise.id,
        totalSets: setsCount,
        currentSetIndex: 0,
        sets: [],
        startedAt: Date.now(),
      };

      await saveActiveSession(session);
      setActiveSession(session);
      setInputValue(null);
      return session;
    },
    [currentExercise],
  );

  /**
   * Resume an existing session (already loaded from storage on mount).
   * This is a no-op if session is already hydrated.
   */
  const resumeSession = useCallback(() => {
    // Session is already hydrated on mount via loadActiveSession
    // This method exists for explicit intent in UI
    return activeSession;
  }, [activeSession]);

  /**
   * Update the current input value (UI-only, not persisted).
   */
  const updateSessionValue = useCallback((value: number | null) => {
    setInputValue(value);
  }, []);

  /**
   * Cancel the session. Clears storage and state.
   */
  const cancelSession = useCallback(async () => {
    await clearActiveSession();
    setActiveSession(null);
    setInputValue(null);
  }, []);

  /**
   * Save the current set and advance to next set.
   * Persists to storage. Returns false if on last set.
   */
  const saveSetAndAdvance = useCallback(async () => {
    if (!activeSession || inputValue === null) return false;
    if (!currentExercise) return false;

    // Don't advance if we're on the last set
    if (activeSession.currentSetIndex >= activeSession.totalSets - 1) {
      return false;
    }

    const isTimeInput = currentExercise.targetType === "time";

    const completedSet: PullupSet = {
      setIndex: activeSession.currentSetIndex,
      ...(isTimeInput
        ? { timeCompleted: inputValue }
        : { repsCompleted: inputValue }),
    };

    const updatedSession: ActivePullupSession = {
      ...activeSession,
      sets: [...activeSession.sets, completedSet],
      currentSetIndex: activeSession.currentSetIndex + 1,
    };

    await saveActiveSession(updatedSession);
    setActiveSession(updatedSession);
    setInputValue(null);

    return true;
  }, [activeSession, inputValue, currentExercise]);

  /**
   * Remove the last completed set and go back to it.
   * Persists to storage. Returns false if no sets to remove.
   */
  const goToPreviousSet = useCallback(async () => {
    if (!activeSession || activeSession.sets.length === 0) {
      return false;
    }

    const previousSets = activeSession.sets.slice(0, -1);
    const removedSet = activeSession.sets[activeSession.sets.length - 1];

    const updatedSession: ActivePullupSession = {
      ...activeSession,
      sets: previousSets,
      currentSetIndex: removedSet.setIndex,
    };

    await saveActiveSession(updatedSession);
    setActiveSession(updatedSession);
    setInputValue(removedSet.repsCompleted ?? removedSet.timeCompleted ?? null);

    return true;
  }, [activeSession]);

  /**
   * Remove a specific completed set by index.
   * Persists to storage. Adjusts currentSetIndex accordingly.
   */
  const removeCompletedSet = useCallback(
    async (setIndex: number) => {
      if (!activeSession) return false;

      const setToRemove = activeSession.sets.find(
        (s) => s.setIndex === setIndex,
      );
      if (!setToRemove) return false;

      // Remove the set and reindex remaining sets
      const updatedSets = activeSession.sets
        .filter((s) => s.setIndex !== setIndex)
        .map((s, idx) => ({
          ...s,
          setIndex: idx,
        }));

      const updatedSession: ActivePullupSession = {
        ...activeSession,
        sets: updatedSets,
        currentSetIndex: updatedSets.length,
      };

      await saveActiveSession(updatedSession);
      setActiveSession(updatedSession);
      setInputValue(null);

      return true;
    },
    [activeSession],
  );

  /**
   * Complete the session. Saves to history, clears active session from storage.
   */
  const completeSession = useCallback(async () => {
    if (!activeSession || inputValue === null || !currentExercise) {
      return null;
    }

    const isTimeInput = currentExercise.targetType === "time";

    // Save the final set
    const finalSet: PullupSet = {
      setIndex: activeSession.currentSetIndex,
      ...(isTimeInput
        ? { timeCompleted: inputValue }
        : { repsCompleted: inputValue }),
    };

    const allSets = [...activeSession.sets, finalSet];

    // Calculate total value (sum of all sets)
    const totalValue = allSets.reduce((sum, set) => {
      return sum + (set.repsCompleted ?? set.timeCompleted ?? 0);
    }, 0);

    // Record to history
    const updatedProgress = await recordPullupSession(
      activeSession.exerciseId,
      totalValue,
      allSets,
      currentExercise.sessionsRequired,
      PULLUP_PROGRAM.totalExercises,
    );

    // Clear active session from storage
    await clearActiveSession();

    setProgress(updatedProgress);
    setActiveSession(null);
    setInputValue(null);

    return {
      progress: updatedProgress,
      advanced:
        updatedProgress.currentExerciseIndex !== currentExerciseIndex ||
        updatedProgress.isCompleted,
      programCompleted: updatedProgress.isCompleted,
    };
  }, [activeSession, inputValue, currentExercise, currentExerciseIndex]);

  // ============================================
  // Check if Session Active
  // ============================================

  const hasActiveSession = activeSession !== null;

  // ============================================
  // Get All Exercise Progress (for overview)
  // ============================================

  const getAllExerciseProgress = useCallback(() => {
    return PULLUP_PROGRAM_EXERCISES.map((exercise, index) => {
      const exerciseProgress = progress?.exerciseProgress[exercise.id];
      const completedSessions = exerciseProgress?.completedSessions ?? 0;
      // Exercise is unlocked if:
      // 1. We haven't started (index 0 is unlocked by default)
      // 2. Index is at or before current exercise index
      // 3. Program is completed (all exercises are unlocked)
      const isUnlocked =
        isCompleted || index <= (progress?.currentExerciseIndex ?? 0);
      const isComplete = completedSessions >= exercise.sessionsRequired;

      return {
        exercise,
        completedSessions,
        isUnlocked,
        isComplete,
        isCurrent: index === currentExerciseIndex && !isCompleted,
        sessionHistory: exerciseProgress?.sessionHistory ?? [],
      };
    });
  }, [progress, currentExerciseIndex, isCompleted]);

  // ============================================
  // Set-Level Derived State
  // ============================================

  const currentSetIndex = activeSession?.currentSetIndex ?? 0;
  const totalSets = activeSession?.totalSets ?? 0;
  const completedSets = activeSession?.sets ?? [];
  const isLastSet = activeSession
    ? activeSession.currentSetIndex === activeSession.totalSets - 1
    : false;
  const canGoBack = completedSets.length > 0;

  return {
    // State
    progress,
    activeSession,
    isLoading,
    inputValue,

    // Derived
    hasStarted,
    isCompleted,
    currentExercise,
    currentExerciseIndex,
    hasActiveSession,

    // Set-level state
    currentSetIndex,
    totalSets,
    completedSets,
    isLastSet,
    canGoBack,

    // Progress helpers
    getSessionsCompleted,
    getSessionsRemaining,
    getCurrentExerciseProgress,
    getAllExerciseProgress,

    // Program actions
    startProgram,
    resetProgram,
    refresh,

    // Session actions
    startSession,
    resumeSession,
    updateSessionValue,
    cancelSession,
    saveSetAndAdvance,
    goToPreviousSet,
    removeCompletedSet,
    completeSession,
  };
}
