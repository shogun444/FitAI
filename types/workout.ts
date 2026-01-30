// Workout Data Models

// Exercise template from catalog
export interface ExerciseTemplate {
  id: string;
  name: string;
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
}

export interface TimerState {
  isRunning: boolean;
  remaining: number; // seconds
  duration: number; // total duration
}
