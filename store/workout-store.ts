import { getWorkouts, saveWorkout } from "@/lib/storage";
import { Exercise, TimerState, WorkoutSession, WorkoutSet } from "@/types";
import * as Crypto from "expo-crypto";
import { create } from "zustand";

const DEFAULT_REST_DURATION = 90; // seconds
const DEFAULT_WORKING_SETS = 5;

// Helper to create a default empty set
function createDefaultSet(): WorkoutSet {
  return {
    id: Crypto.randomUUID(),
    reps: null,
    weight: null,
    time: null,
    completed: false,
    isDefault: true,
    createdAt: Date.now(),
  };
}

// Helper to check if a set was touched (edited or completed)
function isSetTouched(set: WorkoutSet): boolean {
  return set.completed || set.reps !== null || set.weight !== null;
}

interface WorkoutStore {
  // Current workout session
  currentWorkout: WorkoutSession | null;
  lastCompletedWorkout: WorkoutSession | null;
  pastWorkouts: WorkoutSession[];

  // Timer state
  timer: TimerState;
  timerInterval: ReturnType<typeof setInterval> | null;

  // Workout actions
  startWorkout: () => void;
  endWorkout: () => Promise<void>;
  cancelWorkout: () => void;

  // Exercise actions
  addExercise: (name: string) => void;
  removeExercise: (exerciseId: string) => void;

  // Set actions
  addSet: (exerciseId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    reps: number | null,
    weight: number | null,
  ) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;

  // Timer actions
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setRestDuration: (duration: number) => void;

  // Persistence
  loadWorkouts: () => Promise<void>;

  // History lookup
  getLastSessionForExercise: (exerciseName: string) => Exercise | null;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  currentWorkout: null,
  lastCompletedWorkout: null,
  pastWorkouts: [],
  timer: {
    isRunning: false,
    remaining: DEFAULT_REST_DURATION,
    duration: DEFAULT_REST_DURATION,
  },
  timerInterval: null,

  startWorkout: () => {
    set({
      currentWorkout: {
        id: Crypto.randomUUID(),
        exercises: [],
        startedAt: Date.now(),
        endedAt: null,
        duration: 0,
      },
    });
  },

  endWorkout: async () => {
    const { currentWorkout, timerInterval } = get();
    if (!currentWorkout) return;

    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Filter out untouched default sets before saving
    const cleanedExercises = currentWorkout.exercises
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets.filter(isSetTouched),
      }))
      .filter((exercise) => exercise.sets.length > 0); // Remove exercises with no touched sets

    const completedWorkout: WorkoutSession = {
      ...currentWorkout,
      exercises: cleanedExercises,
      endedAt: Date.now(),
      duration: Math.floor((Date.now() - currentWorkout.startedAt) / 1000),
    };

    await saveWorkout(completedWorkout);

    set((state) => ({
      currentWorkout: null,
      lastCompletedWorkout: completedWorkout,
      pastWorkouts: [completedWorkout, ...state.pastWorkouts],
      timer: {
        isRunning: false,
        remaining: DEFAULT_REST_DURATION,
        duration: DEFAULT_REST_DURATION,
      },
      timerInterval: null,
    }));
  },

  cancelWorkout: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      currentWorkout: null,
      timer: {
        isRunning: false,
        remaining: DEFAULT_REST_DURATION,
        duration: DEFAULT_REST_DURATION,
      },
      timerInterval: null,
    });
  },

  addExercise: (name: string) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    // Create 5 default working sets
    const defaultSets: WorkoutSet[] = Array.from(
      { length: DEFAULT_WORKING_SETS },
      () => createDefaultSet(),
    );

    const newExercise: Exercise = {
      id: Crypto.randomUUID(),
      name,
      sets: defaultSets,
      createdAt: Date.now(),
    };

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, newExercise],
      },
    });
  },

  removeExercise: (exerciseId: string) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: currentWorkout.exercises.filter((e) => e.id !== exerciseId),
      },
    });
  },

  addSet: (exerciseId: string) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    // Add a new non-default set (for "+ Add working set" action)
    const newSet: WorkoutSet = {
      id: Crypto.randomUUID(),
      reps: null,
      weight: null,
      time: null,
      completed: false,
      isDefault: false,
      createdAt: Date.now(),
    };

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: currentWorkout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, newSet] }
            : exercise,
        ),
      },
    });
  },

  updateSet: (
    exerciseId: string,
    setId: string,
    reps: number | null,
    weight: number | null,
  ) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: currentWorkout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((s) =>
                  s.id === setId ? { ...s, reps, weight } : s,
                ),
              }
            : exercise,
        ),
      },
    });
  },

  toggleSetCompleted: (exerciseId: string, setId: string) => {
    const { currentWorkout, startTimer, timer } = get();
    if (!currentWorkout) return;

    let wasCompleted = false;

    const updatedExercises = currentWorkout.exercises.map((exercise) => {
      if (exercise.id !== exerciseId) return exercise;

      return {
        ...exercise,
        sets: exercise.sets.map((s) => {
          if (s.id !== setId) return s;
          wasCompleted = !s.completed;
          return { ...s, completed: !s.completed };
        }),
      };
    });

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: updatedExercises,
      },
    });

    // Auto-start timer when set is marked complete (use selected duration)
    if (wasCompleted) {
      startTimer(timer.duration);
    }
  },

  removeSet: (exerciseId: string, setId: string) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    set({
      currentWorkout: {
        ...currentWorkout,
        exercises: currentWorkout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: exercise.sets.filter((s) => s.id !== setId) }
            : exercise,
        ),
      },
    });
  },

  startTimer: (duration: number = DEFAULT_REST_DURATION) => {
    const { timerInterval } = get();

    // Clear existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    set({
      timer: {
        isRunning: true,
        remaining: duration,
        duration,
      },
    });

    const interval = setInterval(() => {
      const { timer } = get();

      if (timer.remaining <= 1) {
        clearInterval(interval);
        set({
          timer: {
            ...timer,
            isRunning: false,
            remaining: 0,
          },
          timerInterval: null,
        });
        return;
      }

      set({
        timer: {
          ...timer,
          remaining: timer.remaining - 1,
        },
      });
    }, 1000);

    set({ timerInterval: interval });
  },

  pauseTimer: () => {
    const { timerInterval, timer } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      timer: { ...timer, isRunning: false },
      timerInterval: null,
    });
  },

  resetTimer: () => {
    const { timerInterval, timer } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      timer: {
        isRunning: false,
        remaining: timer.duration,
        duration: timer.duration,
      },
      timerInterval: null,
    });
  },

  setRestDuration: (duration: number) => {
    const { timerInterval, timer } = get();
    // Only allow changing when timer is not running
    if (timer.isRunning) return;

    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      timer: {
        isRunning: false,
        remaining: duration,
        duration: duration,
      },
      timerInterval: null,
    });
  },

  loadWorkouts: async () => {
    const workouts = await getWorkouts();
    set({ pastWorkouts: workouts });
  },

  getLastSessionForExercise: (exerciseName: string) => {
    const { pastWorkouts } = get();

    // Iterate through workouts from most recent to oldest
    for (const workout of pastWorkouts) {
      // Find the exercise with matching name (case-insensitive)
      const exercise = workout.exercises.find(
        (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase(),
      );

      if (exercise && exercise.sets.length > 0) {
        return exercise;
      }
    }

    return null;
  },
}));
