/**
 * Types for the "Unlock Your First Pull-up" guided program.
 *
 * This is a COACH-LED, FOLLOW-ALONG program, NOT a generic workout tracker.
 * Exercises are PROGRAM-EXCLUSIVE and not in the global exercise catalog.
 */

// ============================================
// Exercise Definition
// ============================================

export type PullupExerciseInputType = "reps" | "time";

export interface PullupProgramExercise {
  id: string;
  name: string;
  instructions: string[];
  targetType: PullupExerciseInputType;
  targetValue: number;
  targetUnit: string; // "reps" or "seconds"
  sessionsRequired: number; // Sessions needed before advancing
  media?: string; // Placeholder for GIF/image path
}

// ============================================
// Set Data (within a session)
// ============================================

export interface PullupSet {
  setIndex: number;
  repsCompleted?: number;
  timeCompleted?: number;
}

// ============================================
// Session Data
// ============================================

export interface PullupSession {
  id: string;
  exerciseId: string;
  value: number; // reps or seconds achieved (legacy, kept for compatibility)
  sets: PullupSet[]; // All sets completed in this session
  completedAt: number;
}

// ============================================
// Exercise Progress
// ============================================

export interface PullupExerciseProgress {
  completedSessions: number;
  sessionHistory: PullupSession[];
}

// ============================================
// Program Progress (Persisted)
// ============================================

export interface PullupProgramProgress {
  /** Index of current exercise in the program (0, 1, 2) */
  currentExerciseIndex: number;

  /** Progress per exercise */
  exerciseProgress: {
    [exerciseId: string]: PullupExerciseProgress;
  };

  /** Whether the entire program is completed */
  isCompleted: boolean;

  /** When the user started the program */
  startedAt: number;

  /** When the last session was completed */
  lastSessionAt: number | null;
}

// ============================================
// Active Session (In-Memory)
// ============================================

export interface ActivePullupSession {
  exerciseId: string;
  exerciseName: string;
  startedAt: number;
  totalSets: number; // Total sets in this session
  currentSetIndex: number; // 0-based index of current set
  completedSets: PullupSet[]; // Sets completed so far
  value: number | null; // User's input for current set
}
