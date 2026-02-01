/**
 * Program Instance Types
 *
 * ProgramInstance is the single source of truth for an active program.
 * Created after calibration, updated after each session.
 */

// ============================================
// Program Lifts (Locked for Weighted Calisthenics 5x5)
// ============================================

export type ProgramLiftId = "weighted-pullups" | "weighted-dips" | "squats";

export interface ProgramLift {
  id: ProgramLiftId;
  name: string;
  description: string;
}

export const PROGRAM_LIFTS: ProgramLift[] = [
  {
    id: "weighted-pullups",
    name: "Weighted Pull-ups",
    description: "Pull-ups with added weight (belt or vest)",
  },
  {
    id: "weighted-dips",
    name: "Weighted Dips",
    description: "Dips with added weight (belt or vest)",
  },
  {
    id: "squats",
    name: "Squats",
    description: "Barbell back squats or weighted squats",
  },
];

// ============================================
// Calibration Types
// ============================================

export interface LiftCalibration {
  liftId: ProgramLiftId;
  prWeight: number; // Highest PR in kg
  workingWeight: number; // Current working weight in kg
  canComplete5Reps: boolean; // Can complete 5 reps at working weight?
}

export interface CalibrationResult {
  liftId: ProgramLiftId;
  startingWeight: number; // Final calibrated starting weight
  adjustmentMessage: string | null; // Explanation if weight was adjusted
}

// ============================================
// Session Performance Types
// ============================================

/**
 * Performance tier classification for progression.
 *
 * Tier A (Dominant): 5/5 sets × 5 reps OR 4/5 with clear reserve → +5kg
 * Tier B (Solid): 4/5 sets × 5 reps near max effort → +1.5-2kg
 * Tier C (Partial): 3/5 sets × 5 reps → +1kg
 * Tier D (Miss): ≤2 sets completed → Same weight
 */
export type PerformanceTier = "A" | "B" | "C" | "D";

export interface LiftPerformance {
  liftId: ProgramLiftId;
  weight: number;
  setsCompleted: number; // Out of 5
  repsPerSet: number[]; // Array of 5, each 0-5
  feltEasy: boolean; // Did user feel they had reserve?
  tier: PerformanceTier;
  nextWeight: number;
  progressionMessage: string;
}

export interface SessionPerformance {
  sessionIndex: number;
  date: number; // timestamp
  lifts: LiftPerformance[];
}

// ============================================
// Program Instance (Source of Truth)
// ============================================

export interface ProgramLiftState {
  liftId: ProgramLiftId;
  currentWeight: number; // Weight for next session
  lastPerformance: LiftPerformance | null;
}

export type ProgramStatus = "active" | "paused" | "completed";

/**
 * Session status for in-progress workout tracking.
 * - idle: No session in progress
 * - in_progress: Session started, user actively working out
 */
export type SessionStatus = "idle" | "in_progress";

/**
 * In-progress session data.
 * Persisted to allow resume after app kill/navigation.
 */
export interface CurrentProgramSession {
  /** Session index at time of start */
  sessionIndex: number;
  /** When session started (timestamp) */
  startedAt: number;
  /** Reps recorded per lift (liftId -> array of reps, null = not logged) */
  repsPerLift: Record<ProgramLiftId, (number | null)[]>;
  /** Current active lift index */
  currentLiftIndex: number;
  /** Current active set index within the lift */
  currentSetIndex: number;
}

export interface ProgramInstance {
  id: string;
  programId: string;
  startDate: number; // timestamp
  sessionIndex: number; // Current session (starts at 1)
  lifts: ProgramLiftState[];
  frequency: number; // Sessions per week (locked at 2)
  status: ProgramStatus;
  history: SessionPerformance[];
  /** Current in-progress session (null if idle) */
  currentSession: CurrentProgramSession | null;
  /** Session status for quick checks */
  sessionStatus: SessionStatus;
}

// ============================================
// Session Prescription (What user sees today)
// ============================================

export interface PrescribedLift {
  liftId: ProgramLiftId;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface ProgramSession {
  sessionIndex: number;
  lifts: PrescribedLift[];
}

/**
 * Get prescribed session from program instance.
 * All sessions follow 5×5 structure.
 */
export function getPrescribedSession(
  instance: ProgramInstance,
): ProgramSession {
  return {
    sessionIndex: instance.sessionIndex,
    lifts: instance.lifts.map((lift) => {
      const liftDef = PROGRAM_LIFTS.find((l) => l.id === lift.liftId)!;
      return {
        liftId: lift.liftId,
        name: liftDef.name,
        sets: 5,
        reps: 5,
        weight: lift.currentWeight,
      };
    }),
  };
}
