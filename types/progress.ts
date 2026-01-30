import { WorkoutSession, WorkoutSet } from "./workout";

// ============================================
// Progress Types
// ============================================

export interface ConsistencyMetrics {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
}

export interface BestSet {
  weight: number;
  reps: number;
  date: number;
}

export interface ExercisePR {
  exerciseName: string;
  bestSet: BestSet;
  lastSession: BestSet | null;
}

export interface StrengthMetrics {
  totalPRCount: number;
  exercisePRs: ExercisePR[];
}

export interface ProgressData {
  consistency: ConsistencyMetrics;
  strength: StrengthMetrics;
}

// ============================================
// Metric Calculation Functions
// ============================================

/**
 * Get the start of day timestamp (midnight) for a given date
 */
function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get the start of the current week (Monday midnight)
 */
function getStartOfWeek(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

/**
 * Get the start of the current month
 */
function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * Calculate consistency metrics from workout history
 */
export function calculateConsistencyMetrics(
  workouts: WorkoutSession[],
): ConsistencyMetrics {
  // Only count completed workouts (with endedAt set)
  const completedWorkouts = workouts.filter((w) => w.endedAt !== null);

  const totalWorkouts = completedWorkouts.length;

  if (totalWorkouts === 0) {
    return {
      totalWorkouts: 0,
      workoutsThisWeek: 0,
      workoutsThisMonth: 0,
      currentStreak: 0,
    };
  }

  const weekStart = getStartOfWeek();
  const monthStart = getStartOfMonth();

  const workoutsThisWeek = completedWorkouts.filter(
    (w) => w.startedAt >= weekStart,
  ).length;

  const workoutsThisMonth = completedWorkouts.filter(
    (w) => w.startedAt >= monthStart,
  ).length;

  // Calculate streak: consecutive days with at least one workout
  const currentStreak = calculateStreak(completedWorkouts);

  return {
    totalWorkouts,
    workoutsThisWeek,
    workoutsThisMonth,
    currentStreak,
  };
}

/**
 * Calculate the current streak (consecutive days with workouts)
 */
function calculateStreak(workouts: WorkoutSession[]): number {
  if (workouts.length === 0) return 0;

  // Get unique workout days (normalized to start of day)
  const workoutDays = new Set<number>();
  workouts.forEach((w) => {
    workoutDays.add(getStartOfDay(w.startedAt));
  });

  // Sort days in descending order (most recent first)
  const sortedDays = Array.from(workoutDays).sort((a, b) => b - a);

  const today = getStartOfDay(Date.now());
  const yesterday = today - 24 * 60 * 60 * 1000;

  // Streak must start from today or yesterday
  const mostRecentDay = sortedDays[0];
  if (mostRecentDay !== today && mostRecentDay !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDay = mostRecentDay;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDay = currentDay - 24 * 60 * 60 * 1000;
    if (sortedDays[i] === prevDay) {
      streak++;
      currentDay = prevDay;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Compare two sets: returns true if setA is better than setB
 * Best set = highest weight; tie-breaker = more reps
 */
function isBetterSet(setA: WorkoutSet, setB: BestSet | null): boolean {
  if (!setB) return true;
  if (setA.weight === null || setA.reps === null) return false;

  if (setA.weight > setB.weight) return true;
  if (setA.weight === setB.weight && setA.reps > setB.reps) return true;
  return false;
}

/**
 * Calculate strength metrics (PRs) from workout history
 */
export function calculateStrengthMetrics(
  workouts: WorkoutSession[],
): StrengthMetrics {
  // Only count completed workouts
  const completedWorkouts = workouts.filter((w) => w.endedAt !== null);

  if (completedWorkouts.length === 0) {
    return {
      totalPRCount: 0,
      exercisePRs: [],
    };
  }

  // Map: exerciseName -> { bestSet, lastSession, prCount }
  const exerciseMap = new Map<
    string,
    {
      bestSet: BestSet;
      lastSessionDate: number;
      lastSessionBest: BestSet | null;
      prCount: number;
    }
  >();

  // Sort workouts by date (oldest first) to track PRs chronologically
  const sortedWorkouts = [...completedWorkouts].sort(
    (a, b) => a.startedAt - b.startedAt,
  );

  for (const workout of sortedWorkouts) {
    for (const exercise of workout.exercises) {
      // Get only completed sets with valid data
      const validSets = exercise.sets.filter(
        (s) => s.completed && s.weight !== null && s.reps !== null,
      );

      if (validSets.length === 0) continue;

      // Find best set in this session
      let sessionBest: BestSet | null = null;
      for (const set of validSets) {
        if (
          !sessionBest ||
          set.weight! > sessionBest.weight ||
          (set.weight === sessionBest.weight && set.reps! > sessionBest.reps)
        ) {
          sessionBest = {
            weight: set.weight!,
            reps: set.reps!,
            date: workout.startedAt,
          };
        }
      }

      if (!sessionBest) continue;

      const existing = exerciseMap.get(exercise.name);

      if (!existing) {
        // First time seeing this exercise - it's a PR
        exerciseMap.set(exercise.name, {
          bestSet: sessionBest,
          lastSessionDate: workout.startedAt,
          lastSessionBest: sessionBest,
          prCount: 1,
        });
      } else {
        // Update last session
        const updatedEntry = {
          ...existing,
          lastSessionDate: workout.startedAt,
          lastSessionBest: sessionBest,
        };

        // Check if this is a new PR
        if (
          sessionBest.weight > existing.bestSet.weight ||
          (sessionBest.weight === existing.bestSet.weight &&
            sessionBest.reps > existing.bestSet.reps)
        ) {
          updatedEntry.bestSet = sessionBest;
          updatedEntry.prCount = existing.prCount + 1;
        }

        exerciseMap.set(exercise.name, updatedEntry);
      }
    }
  }

  // Build result
  const exercisePRs: ExercisePR[] = [];
  let totalPRCount = 0;

  exerciseMap.forEach((data, exerciseName) => {
    totalPRCount += data.prCount;
    exercisePRs.push({
      exerciseName,
      bestSet: data.bestSet,
      lastSession:
        data.lastSessionDate !== data.bestSet.date
          ? data.lastSessionBest
          : null,
    });
  });

  // Sort by exercise name for consistent display
  exercisePRs.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  return {
    totalPRCount,
    exercisePRs,
  };
}

/**
 * Calculate all progress data from workout history
 */
export function calculateProgressData(
  workouts: WorkoutSession[],
): ProgressData {
  return {
    consistency: calculateConsistencyMetrics(workouts),
    strength: calculateStrengthMetrics(workouts),
  };
}
