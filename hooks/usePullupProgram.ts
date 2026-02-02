import {
  getPullupExerciseByIndex,
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import {
  createDefaultProgress,
  loadPullupProgress,
  recordPullupSession,
  resetPullupProgress,
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

  // ============================================
  // Load Progress on Mount
  // ============================================

  useEffect(() => {
    async function load() {
      const loaded = await loadPullupProgress();
      setProgress(loaded);
      setIsLoading(false);
    }
    load();
  }, []);

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

  const startSession = useCallback(
    (setsCount: number = DEFAULT_SETS_PER_SESSION) => {
      if (!currentExercise) return null;

      const session: ActivePullupSession = {
        exerciseId: currentExercise.id,
        exerciseName: currentExercise.name,
        startedAt: Date.now(),
        totalSets: setsCount,
        currentSetIndex: 0,
        completedSets: [],
        value: null,
      };
      setActiveSession(session);
      return session;
    },
    [currentExercise],
  );

  const updateSessionValue = useCallback((value: number | null) => {
    setActiveSession((prev) => (prev ? { ...prev, value } : null));
  }, []);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  /**
   * Save the current set and advance to next set.
   * Returns false if on last set (use completeSession instead).
   */
  const saveSetAndAdvance = useCallback(() => {
    if (!activeSession || activeSession.value === null) return false;
    if (!currentExercise) return false;

    // Don't advance if we're on the last set
    if (activeSession.currentSetIndex >= activeSession.totalSets - 1) {
      return false;
    }

    const isTimeInput = currentExercise.targetType === "time";

    const completedSet: PullupSet = {
      setIndex: activeSession.currentSetIndex,
      ...(isTimeInput
        ? { timeCompleted: activeSession.value }
        : { repsCompleted: activeSession.value }),
    };

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        completedSets: [...prev.completedSets, completedSet],
        currentSetIndex: prev.currentSetIndex + 1,
        value: null, // Reset input for next set
      };
    });

    return true;
  }, [activeSession, currentExercise]);

  /**
   * Remove the last completed set and go back to it.
   * Returns false if there are no completed sets to remove.
   */
  const goToPreviousSet = useCallback(() => {
    if (!activeSession || activeSession.completedSets.length === 0) {
      return false;
    }

    const previousSets = activeSession.completedSets.slice(0, -1);
    const removedSet =
      activeSession.completedSets[activeSession.completedSets.length - 1];

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        completedSets: previousSets,
        currentSetIndex: removedSet.setIndex,
        value: removedSet.repsCompleted ?? removedSet.timeCompleted ?? null,
      };
    });

    return true;
  }, [activeSession]);

  /**
   * Remove a specific completed set by index.
   * Adjusts currentSetIndex and remaining sets accordingly.
   */
  const removeCompletedSet = useCallback(
    (setIndex: number) => {
      if (!activeSession) return false;

      const setToRemove = activeSession.completedSets.find(
        (s) => s.setIndex === setIndex,
      );
      if (!setToRemove) return false;

      // Remove the set and reindex remaining sets
      const updatedSets = activeSession.completedSets
        .filter((s) => s.setIndex !== setIndex)
        .map((s, idx) => ({
          ...s,
          setIndex: idx,
        }));

      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          completedSets: updatedSets,
          currentSetIndex: updatedSets.length,
          value: null,
        };
      });

      return true;
    },
    [activeSession],
  );

  const completeSession = useCallback(async () => {
    if (!activeSession || activeSession.value === null || !currentExercise) {
      return null;
    }

    const isTimeInput = currentExercise.targetType === "time";

    // Save the final set
    const finalSet: PullupSet = {
      setIndex: activeSession.currentSetIndex,
      ...(isTimeInput
        ? { timeCompleted: activeSession.value }
        : { repsCompleted: activeSession.value }),
    };

    const allSets = [...activeSession.completedSets, finalSet];

    // Calculate total value (sum of all sets)
    const totalValue = allSets.reduce((sum, set) => {
      return sum + (set.repsCompleted ?? set.timeCompleted ?? 0);
    }, 0);

    const updatedProgress = await recordPullupSession(
      activeSession.exerciseId,
      totalValue,
      allSets,
      currentExercise.sessionsRequired,
      PULLUP_PROGRAM.totalExercises,
    );

    setProgress(updatedProgress);
    setActiveSession(null);

    return {
      progress: updatedProgress,
      advanced:
        updatedProgress.currentExerciseIndex !== currentExerciseIndex ||
        updatedProgress.isCompleted,
      programCompleted: updatedProgress.isCompleted,
    };
  }, [activeSession, currentExercise, currentExerciseIndex]);

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
      const isUnlocked = index <= (progress?.currentExerciseIndex ?? 0);
      const isComplete = completedSessions >= exercise.sessionsRequired;

      return {
        exercise,
        completedSessions,
        isUnlocked,
        isComplete,
        isCurrent: index === currentExerciseIndex && !isCompleted,
      };
    });
  }, [progress, currentExerciseIndex, isCompleted]);

  // ============================================
  // Set-Level Derived State
  // ============================================

  const currentSetIndex = activeSession?.currentSetIndex ?? 0;
  const totalSets = activeSession?.totalSets ?? 0;
  const completedSets = activeSession?.completedSets ?? [];
  const isLastSet = activeSession
    ? activeSession.currentSetIndex === activeSession.totalSets - 1
    : false;
  const canGoBack = completedSets.length > 0;

  return {
    // State
    progress,
    activeSession,
    isLoading,

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

    // Session actions
    startSession,
    updateSessionValue,
    cancelSession,
    saveSetAndAdvance,
    goToPreviousSet,
    removeCompletedSet,
    completeSession,
  };
}
