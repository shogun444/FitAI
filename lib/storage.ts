import { EXERCISE_CATALOG } from "@/data/exercises";
import { ExerciseTemplate, WorkoutSession } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WORKOUTS_KEY = "fitai_workouts";
const EXERCISES_KEY = "fitai_exercises";
const SEED_FLAG_KEY = "fitai_exercises_seeded";

// Workout session storage
export async function saveWorkout(workout: WorkoutSession): Promise<void> {
  try {
    const existing = await getWorkouts();
    const updated = [workout, ...existing];
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save workout:", error);
  }
}

export async function getWorkouts(): Promise<WorkoutSession[]> {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load workouts:", error);
    return [];
  }
}

export async function clearWorkouts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUTS_KEY);
  } catch (error) {
    console.error("Failed to clear workouts:", error);
  }
}

// Exercise catalog storage
export async function getExercises(): Promise<ExerciseTemplate[]> {
  try {
    const data = await AsyncStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load exercises:", error);
    return [];
  }
}

export async function saveExercises(
  exercises: ExerciseTemplate[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error("Failed to save exercises:", error);
  }
}

// Seed function - runs once on app start
export async function seedExercises(): Promise<void> {
  try {
    const alreadySeeded = await AsyncStorage.getItem(SEED_FLAG_KEY);
    if (alreadySeeded) {
      return; // Already seeded, do nothing
    }

    const existing = await getExercises();
    if (existing.length > 0) {
      // Data exists, mark as seeded and return
      await AsyncStorage.setItem(SEED_FLAG_KEY, "true");
      return;
    }

    // Seed the exercise catalog
    await saveExercises(EXERCISE_CATALOG);
    await AsyncStorage.setItem(SEED_FLAG_KEY, "true");
    console.log("Exercise catalog seeded successfully");
  } catch (error) {
    console.error("Failed to seed exercises:", error);
  }
}
