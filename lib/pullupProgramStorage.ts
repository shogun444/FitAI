import {
  PullupProgramProgress,
  PullupSession,
  PullupSet,
} from "@/types/pullup-program";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "pullup-program-progress";

/**
 * Storage layer for "Unlock Your First Pull-up" program.
 *
 * Persists:
 * - Current exercise index
 * - Completed sessions per exercise
 * - Session history
 * - Program completion status
 */

// ============================================
// Default Progress
// ============================================

export function createDefaultProgress(): PullupProgramProgress {
  return {
    currentExerciseIndex: 0,
    exerciseProgress: {},
    isCompleted: false,
    startedAt: Date.now(),
    lastSessionAt: null,
  };
}

// ============================================
// Load Progress
// ============================================

export async function loadPullupProgress(): Promise<PullupProgramProgress | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as PullupProgramProgress;
  } catch (error) {
    console.error("Failed to load pullup program progress:", error);
    return null;
  }
}

// ============================================
// Save Progress
// ============================================

export async function savePullupProgress(
  progress: PullupProgramProgress,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save pullup program progress:", error);
  }
}

// ============================================
// Record Session Completion
// ============================================

export async function recordPullupSession(
  exerciseId: string,
  value: number,
  sets: PullupSet[],
  sessionsRequired: number,
  totalExercises: number,
): Promise<PullupProgramProgress> {
  let progress = await loadPullupProgress();

  if (!progress) {
    progress = createDefaultProgress();
  }

  // Create session record
  const session: PullupSession = {
    id: `${exerciseId}-${Date.now()}`,
    exerciseId,
    value,
    sets,
    completedAt: Date.now(),
  };

  // Initialize exercise progress if needed
  if (!progress.exerciseProgress[exerciseId]) {
    progress.exerciseProgress[exerciseId] = {
      completedSessions: 0,
      sessionHistory: [],
    };
  }

  // Add session and increment count
  progress.exerciseProgress[exerciseId].sessionHistory.push(session);
  progress.exerciseProgress[exerciseId].completedSessions += 1;
  progress.lastSessionAt = Date.now();

  // Check if should advance to next exercise
  const completedSessions =
    progress.exerciseProgress[exerciseId].completedSessions;
  if (completedSessions >= sessionsRequired) {
    // Advance to next exercise
    const nextIndex = progress.currentExerciseIndex + 1;
    if (nextIndex >= totalExercises) {
      // Program complete!
      progress.isCompleted = true;
    } else {
      progress.currentExerciseIndex = nextIndex;
    }
  }

  await savePullupProgress(progress);
  return progress;
}

// ============================================
// Reset Progress
// ============================================

export async function resetPullupProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset pullup program progress:", error);
  }
}

// ============================================
// Check if Program Started
// ============================================

export async function hasPullupProgramStarted(): Promise<boolean> {
  const progress = await loadPullupProgress();
  return progress !== null;
}

// ============================================
// Active Session Persistence
// ============================================

import { ActivePullupSession } from "@/types/pullup-program";

const ACTIVE_SESSION_KEY = "active_pullup_session";

/**
 * Load persisted active session.
 * Returns null if no session exists.
 */
export async function loadActiveSession(): Promise<ActivePullupSession | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as ActivePullupSession;
  } catch (error) {
    console.error("Failed to load active pullup session:", error);
    return null;
  }
}

/**
 * Persist active session to storage.
 * Called on: session start, set completion, navigation to next set.
 */
export async function saveActiveSession(
  session: ActivePullupSession,
): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save active pullup session:", error);
  }
}

/**
 * Clear active session from storage.
 * Called on: session complete, session cancel.
 */
export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear active pullup session:", error);
  }
}
