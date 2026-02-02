import {
  getPullupExerciseByIndex,
  getTotalExercises,
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import {
  clearActiveSession,
  createDefaultProgress,
  loadActiveSession,
  loadPullupProgress,
  recordCompletedSession,
  resetPullupProgress,
  saveActiveSession,
  savePullupProgress,
} from "@/lib/pullupProgramStorage";
import {
  ActivePullupSession,
  ExerciseSessionData,
  PullupProgramProgress,
  PullupSet,
} from "@/types/pullup-program";
import { useCallback, useEffect, useState } from "react";

/** Generate unique session ID */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing "Unlock Your First Pull-up" program state.
 *
 * NEW MODEL (v2):
 * - Every session includes ALL exercises
 * - Program completes after N total sessions (default: 20)
 * - No per-exercise session tracking
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
  const targetSessions =
    progress?.targetSessions ?? PULLUP_PROGRAM.targetSessions;
  const completedSessionsCount = progress?.completedSessions ?? 0;

  // Current exercise in the active session
  const currentExerciseIndex = activeSession?.currentExerciseIndex ?? 0;
  const currentExercise = getPullupExerciseByIndex(currentExerciseIndex);
  const totalExercises = getTotalExercises();

  // ============================================
  // Progress Helpers
  // ============================================

  const getSessionsCompleted = useCallback(() => {
    return completedSessionsCount;
  }, [completedSessionsCount]);

  const getSessionsRemaining = useCallback(() => {
    return targetSessions - completedSessionsCount;
  }, [targetSessions, completedSessionsCount]);

  const getNextSessionNumber = useCallback(() => {
    return completedSessionsCount + 1;
  }, [completedSessionsCount]);

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
   * Start a new session with all exercises.
   * Persists immediately.
   */
  const startSession = useCallback(async () => {
    const sessionNumber = completedSessionsCount + 1;

    // Initialize exercise data for all exercises
    const exercises: ExerciseSessionData[] = PULLUP_PROGRAM_EXERCISES.map(
      (ex) => ({
        exerciseId: ex.id,
        sets: [],
      }),
    );

    const session: ActivePullupSession = {
      programId: "unlock-first-pullup",
      sessionId: generateSessionId(),
      sessionNumber,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      exercises,
      startedAt: Date.now(),
    };

    await saveActiveSession(session);
    setActiveSession(session);
    setInputValue(null);
    return session;
  }, [completedSessionsCount]);

  /**
   * Resume an existing session (already loaded from storage on mount).
   */
  const resumeSession = useCallback(() => {
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

  // ============================================
  // Set Management
  // ============================================

  /**
   * Get current exercise's sets from the active session
   */
  const getCurrentExerciseSets = useCallback(() => {
    if (!activeSession) return [];
    const exerciseData =
      activeSession.exercises[activeSession.currentExerciseIndex];
    return exerciseData?.sets ?? [];
  }, [activeSession]);

  /**
   * Get total sets required for current exercise
   */
  const getTotalSetsForCurrentExercise = useCallback(() => {
    if (!currentExercise) return 0;
    return currentExercise.setsPerSession;
  }, [currentExercise]);

  /**
   * Save the current set and advance to next set.
   * If all sets for current exercise are done, advance to next exercise.
   * Returns: { advancedExercise: boolean, sessionComplete: boolean }
   */
  const saveSetAndAdvance = useCallback(async () => {
    if (!activeSession || inputValue === null || !currentExercise) {
      return { advancedExercise: false, sessionComplete: false };
    }

    const isTimeInput = currentExercise.targetType === "time";
    const currentExIdx = activeSession.currentExerciseIndex;
    const currentSetIdx = activeSession.currentSetIndex;
    const totalSetsForExercise = currentExercise.setsPerSession;

    // Create the completed set
    const completedSet: PullupSet = {
      setIndex: currentSetIdx,
      ...(isTimeInput
        ? { timeCompleted: inputValue }
        : { repsCompleted: inputValue }),
    };

    // Update the exercise's sets
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[currentExIdx] = {
      ...updatedExercises[currentExIdx],
      sets: [...updatedExercises[currentExIdx].sets, completedSet],
    };

    const nextSetIndex = currentSetIdx + 1;
    const isLastSetOfExercise = nextSetIndex >= totalSetsForExercise;
    const isLastExercise = currentExIdx >= totalExercises - 1;

    let updatedSession: ActivePullupSession;

    if (isLastSetOfExercise && isLastExercise) {
      // Session is complete - will be handled by completeSession
      // Just save the final set
      updatedSession = {
        ...activeSession,
        exercises: updatedExercises,
        currentSetIndex: nextSetIndex,
      };
      await saveActiveSession(updatedSession);
      setActiveSession(updatedSession);
      setInputValue(null);
      return { advancedExercise: false, sessionComplete: true };
    } else if (isLastSetOfExercise) {
      // Advance to next exercise
      updatedSession = {
        ...activeSession,
        exercises: updatedExercises,
        currentExerciseIndex: currentExIdx + 1,
        currentSetIndex: 0,
      };
      await saveActiveSession(updatedSession);
      setActiveSession(updatedSession);
      setInputValue(null);
      return { advancedExercise: true, sessionComplete: false };
    } else {
      // Advance to next set of same exercise
      updatedSession = {
        ...activeSession,
        exercises: updatedExercises,
        currentSetIndex: nextSetIndex,
      };
      await saveActiveSession(updatedSession);
      setActiveSession(updatedSession);
      setInputValue(null);
      return { advancedExercise: false, sessionComplete: false };
    }
  }, [activeSession, inputValue, currentExercise, totalExercises]);

  /**
   * Remove a specific completed set by index from current exercise.
   */
  const removeCompletedSet = useCallback(
    async (setIndex: number) => {
      if (!activeSession) return false;

      const currentExIdx = activeSession.currentExerciseIndex;
      const exerciseSets = activeSession.exercises[currentExIdx].sets;

      const setToRemove = exerciseSets.find((s) => s.setIndex === setIndex);
      if (!setToRemove) return false;

      // Remove the set and reindex
      const updatedSets = exerciseSets
        .filter((s) => s.setIndex !== setIndex)
        .map((s, idx) => ({ ...s, setIndex: idx }));

      const updatedExercises = [...activeSession.exercises];
      updatedExercises[currentExIdx] = {
        ...updatedExercises[currentExIdx],
        sets: updatedSets,
      };

      const updatedSession: ActivePullupSession = {
        ...activeSession,
        exercises: updatedExercises,
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
   * Complete the entire session.
   * Records to history and clears active session.
   */
  const completeSession = useCallback(async () => {
    if (!activeSession || inputValue === null || !currentExercise) {
      return null;
    }

    const isTimeInput = currentExercise.targetType === "time";
    const currentExIdx = activeSession.currentExerciseIndex;

    // Save the final set
    const finalSet: PullupSet = {
      setIndex: activeSession.currentSetIndex,
      ...(isTimeInput
        ? { timeCompleted: inputValue }
        : { repsCompleted: inputValue }),
    };

    // Update final exercise's sets
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[currentExIdx] = {
      ...updatedExercises[currentExIdx],
      sets: [...updatedExercises[currentExIdx].sets, finalSet],
      completedAt: Date.now(),
    };

    const finalSession: ActivePullupSession = {
      ...activeSession,
      exercises: updatedExercises,
    };

    // Record to history
    const updatedProgress = await recordCompletedSession(finalSession);

    // Clear active session
    await clearActiveSession();

    setProgress(updatedProgress);
    setActiveSession(null);
    setInputValue(null);

    return {
      progress: updatedProgress,
      programCompleted: updatedProgress.isCompleted,
    };
  }, [activeSession, inputValue, currentExercise]);

  // ============================================
  // Derived State for UI
  // ============================================

  const hasActiveSession = activeSession !== null;
  const currentSets = getCurrentExerciseSets();
  const totalSetsForExercise = getTotalSetsForCurrentExercise();
  const currentSetIndex = activeSession?.currentSetIndex ?? 0;
  const isLastSet = currentSetIndex >= totalSetsForExercise - 1;
  const isLastExercise = currentExerciseIndex >= totalExercises - 1;
  const isLastSetOfSession = isLastSet && isLastExercise;
  const canGoBack = currentSets.length > 0;

  // ============================================
  // Get All Exercises (for overview)
  // ============================================

  const getAllExercises = useCallback(() => {
    return PULLUP_PROGRAM_EXERCISES.map((exercise, index) => {
      // Check if this exercise has data in the active session
      const activeExerciseData = activeSession?.exercises[index];
      const setsCompleted = activeExerciseData?.sets.length ?? 0;
      const isCurrentExercise = activeSession?.currentExerciseIndex === index;

      return {
        exercise,
        setsCompleted,
        totalSets: exercise.setsPerSession,
        isCurrentExercise,
        isComplete: setsCompleted >= exercise.setsPerSession,
      };
    });
  }, [activeSession]);

  // ============================================
  // Get Last Session Data (for overview)
  // ============================================

  const getLastSessionData = useCallback(() => {
    if (!progress || progress.sessionHistory.length === 0) return null;
    return progress.sessionHistory[progress.sessionHistory.length - 1];
  }, [progress]);

  return {
    // State
    progress,
    activeSession,
    isLoading,
    inputValue,

    // Program-level derived state
    hasStarted,
    isCompleted,
    targetSessions,
    completedSessionsCount,
    hasActiveSession,

    // Session-level derived state
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    currentSetIndex,
    totalSetsForExercise,
    currentSets,
    isLastSet,
    isLastExercise,
    isLastSetOfSession,
    canGoBack,

    // Progress helpers
    getSessionsCompleted,
    getSessionsRemaining,
    getNextSessionNumber,
    getAllExercises,
    getLastSessionData,

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
    removeCompletedSet,
    completeSession,
  };
}
