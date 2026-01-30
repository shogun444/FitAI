import { getWorkouts, saveWorkout } from "@/lib/storage";
import { Exercise, TimerState, WorkoutSession, WorkoutSet } from "@/types";
import * as Crypto from "expo-crypto";
import { create } from "zustand";

const DEFAULT_REST_DURATION = 90; // seconds

interface WorkoutStore {
  // Current workout session
  currentWorkout: WorkoutSession | null;
  pastWorkouts: WorkoutSession[];

  // Timer state
  timer: TimerState;
  timerInterval: NodeJS.Timeout | null;

  // Workout actions
  startWorkout: () => void;
  endWorkout: () => Promise<void>;
  cancelWorkout: () => void;

  // Exercise actions
  addExercise: (name: string) => void;
  removeExercise: (exerciseId: string) => void;

  // Set actions
  addSet: (exerciseId: string, reps: number, weight: number) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;

  // Timer actions
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setRestDuration: (duration: number) => void;

  // Persistence
  loadWorkouts: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  currentWorkout: null,
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

    const completedWorkout: WorkoutSession = {
      ...currentWorkout,
      endedAt: Date.now(),
      duration: Math.floor((Date.now() - currentWorkout.startedAt) / 1000),
    };

    await saveWorkout(completedWorkout);

    set((state) => ({
      currentWorkout: null,
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

    const newExercise: Exercise = {
      id: Crypto.randomUUID(),
      name,
      sets: [],
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

  addSet: (exerciseId: string, reps: number, weight: number) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const newSet: WorkoutSet = {
      id: Crypto.randomUUID(),
      reps,
      weight,
      completed: false,
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
}));
