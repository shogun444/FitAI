import { PULLUP_PROGRAM } from "@/data/pullup-program";
import {
  ActivePullupSession,
  CompletedPullupSession,
  PullupProgramProgress,
} from "@/types/pullup-program";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mapPullupSessionToHistory } from "./programHistoryAdapter";
import { saveWorkout } from "./storage";

const STORAGE_KEY = "pullup-program-progress-v2";
const ACTIVE_SESSION_KEY = "active_pullup_session_v2";

/**
 * Storage layer for "Unlock Your First Pull-up" program.
 *
 * NEW MODEL (v2):
 * - Program-level session tracking
 * - No per-exercise counters
 * - Full session persistence
 */

// ============================================
// Default Progress
// ============================================

export function createDefaultProgress(): PullupProgramProgress {
  return {
    programId: "unlock-first-pullup",
    targetSessions: PULLUP_PROGRAM.targetSessions,
    completedSessions: 0,
    sessionHistory: [],
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

export async function recordCompletedSession(
  session: ActivePullupSession,
): Promise<PullupProgramProgress> {
  let progress = await loadPullupProgress();

  if (!progress) {
    progress = createDefaultProgress();
  }

  // Create completed session record
  const completedSession: CompletedPullupSession = {
    sessionId: session.sessionId,
    sessionNumber: session.sessionNumber,
    exercises: session.exercises.map((ex) => ({
      ...ex,
      completedAt: Date.now(),
    })),
    completedAt: Date.now(),
  };

  // Update progress
  progress.sessionHistory.push(completedSession);
  progress.completedSessions += 1;
  progress.lastSessionAt = Date.now();

  // Check if program is complete
  if (progress.completedSessions >= progress.targetSessions) {
    progress.isCompleted = true;
  }

  await savePullupProgress(progress);

  // ============================================
  // SAVE TO UNIFIED WORKOUT HISTORY
  // ============================================
  // Convert program session to WorkoutSession format and save
  // to the same history as free workouts for a single source of truth.
  const workoutHistoryEntry = mapPullupSessionToHistory(session);
  await saveWorkout(workoutHistoryEntry);

  return progress;
}

// ============================================
// Reset Progress
// ============================================

export async function resetPullupProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error("Failed to reset pullup program progress:", error);
  }
}

// ============================================
// Active Session Persistence
// ============================================

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
 * Called on: session start, set completion, exercise advancement.
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
