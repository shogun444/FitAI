/**
 * Types for the "Unlock Your First Pull-up" guided program.
 *
 * NEW MODEL (v2):
 * - Every session includes ALL exercises
 * - Program completes after N total sessions (default: 20)
 * - No per-exercise session tracking
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
  setsPerSession: number; // How many sets per session for this exercise
  media?: string; // Placeholder for GIF/image path
}

// ============================================
// Set Data (within an exercise)
// ============================================

export interface PullupSet {
  setIndex: number;
  repsCompleted?: number;
  timeCompleted?: number;
}

// ============================================
// Exercise Progress (within a session)
// ============================================

export interface ExerciseSessionData {
  exerciseId: string;
  sets: PullupSet[];
  completedAt?: number;
}

// ============================================
// Completed Session Record
// ============================================

export interface CompletedPullupSession {
  sessionId: string;
  sessionNumber: number; // 1-indexed (Session 1 of 20)
  exercises: ExerciseSessionData[];
  completedAt: number;
}

// ============================================
// Program Progress (Persisted)
// ============================================

export interface PullupProgramProgress {
  /** Fixed program identifier */
  programId: "unlock-first-pullup";

  /** Target number of sessions to complete the program */
  targetSessions: number;

  /** Number of fully completed sessions */
  completedSessions: number;

  /** History of completed sessions */
  sessionHistory: CompletedPullupSession[];

  /** Whether the entire program is completed */
  isCompleted: boolean;

  /** When the user started the program */
  startedAt: number;

  /** When the last session was completed */
  lastSessionAt: number | null;
}

// ============================================
// Active Session (Persisted)
// ============================================

export interface ActivePullupSession {
  /** Fixed identifier for this program */
  programId: "unlock-first-pullup";

  /** Unique session identifier */
  sessionId: string;

  /** Which session number this is (1-indexed) */
  sessionNumber: number;

  /** Index of current exercise (0, 1, 2) */
  currentExerciseIndex: number;

  /** Current set index within current exercise */
  currentSetIndex: number;

  /** Progress for each exercise in this session */
  exercises: ExerciseSessionData[];

  /** When the session started */
  startedAt: number;
}

// ============================================
// Transient UI State (NOT persisted)
// ============================================

export interface ActiveSessionUIState {
  /** User's current input value for the active set */
  inputValue: number | null;
}
