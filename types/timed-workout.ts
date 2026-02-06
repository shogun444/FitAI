/**
 * Types for Timed Follow-Along Workouts
 *
 * These are guided workouts where the app runs through a sequence
 * of timed exercises and rest periods automatically.
 *
 * Examples: "5 Min Killer Abs", "7 Min HIIT", etc.
 */

// ============================================
// Step Types
// ============================================

export type TimedStepType = "exercise" | "rest";

export interface TimedStep {
  type: TimedStepType;
  name: string; // Exercise name or "Rest"
  duration: number; // Duration in seconds
   image ?: string
}

// ============================================
// Timed Workout Definition
// ============================================

export interface TimedWorkoutProgram {
  id: string;
  name: string;
  description: string;
  totalDuration: number; // Total workout time in seconds
  steps: TimedStep[];
  type: "FREE" | "PAID";

}

// ============================================
// Completed Session Record
// ============================================

export interface CompletedTimedSession {
  sessionId: string;
  programId: string;
  programName: string;
  completedAt: number;
  totalDuration: number; // Actual duration in seconds
}

// ============================================
// Session Progress (for tracking within a session)
// ============================================

export interface TimedSessionProgress {
  programId: string;
  currentStepIndex: number;
  startedAt: number;
  isPaused: boolean;
}
