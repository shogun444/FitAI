// Workout Data Models

// ============================================
// Exercise Categories & Training Types
// ============================================

export type ExerciseCategory = "push" | "pull" | "legs" | "core";
export type TrainingType = "calisthenics" | "weighted" | "gym";

// Exercise template from catalog
export interface ExerciseTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  baseMovement: string;
  trainingTypes: TrainingType[];
  allowsExternalLoad: boolean;
}

export interface WorkoutSet {
  id: string;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  isDefault: boolean;
  createdAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  createdAt: number;
}

export interface WorkoutSession {
  id: string;
  exercises: Exercise[];
  startedAt: number;
  endedAt: number | null;
  duration: number; // in seconds

  // Program workout metadata (optional - only for paid program sessions)
  isProgramWorkout?: boolean;
  programId?: string;
  programName?: string;
  sessionIndex?: number;
  progressionSummary?: string; // e.g., "2 lifts increased weight"
}

export interface TimerState {
  isRunning: boolean;
  remaining: number; // seconds
  duration: number; // total duration
}
