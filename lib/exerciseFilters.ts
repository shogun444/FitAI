import { EXERCISE_CATALOG } from "@/data/exercises";
import { ExerciseCategory, ExerciseTemplate, TrainingType } from "@/types";

/**
 * Filter Options for Exercise Selection
 */
export interface ExerciseFilterOptions {
  categories?: ExerciseCategory[];
  trainingType?: TrainingType | null;
  searchQuery?: string;
}

/**
 * Filter exercises by category, training type, and search query
 * Filters combine with AND logic
 */
export function filterExercises(
  options: ExerciseFilterOptions,
): ExerciseTemplate[] {
  const { categories, trainingType, searchQuery } = options;

  return EXERCISE_CATALOG.filter((exercise) => {
    // Category filter (OR logic within categories)
    if (
      categories &&
      categories.length > 0 &&
      !categories.includes(exercise.category)
    ) {
      return false;
    }

    // Training type filter
    if (trainingType && !exercise.trainingTypes.includes(trainingType)) {
      return false;
    }

    // Search query filter (case-insensitive)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = exercise.name.toLowerCase().includes(query);
      const movementMatch = exercise.baseMovement.toLowerCase().includes(query);
      if (!nameMatch && !movementMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get all exercises for a specific category
 */
export function getExercisesByCategory(
  category: ExerciseCategory,
): ExerciseTemplate[] {
  return filterExercises({ categories: [category] });
}

/**
 * Get all exercises for a specific training type
 */
export function getExercisesByTrainingType(
  trainingType: TrainingType,
): ExerciseTemplate[] {
  return filterExercises({ trainingType });
}

/**
 * Get exercises that allow external load
 */
export function getWeightedExercises(): ExerciseTemplate[] {
  return EXERCISE_CATALOG.filter((exercise) => exercise.allowsExternalLoad);
}

/**
 * Get exercises by base movement pattern
 */
export function getExercisesByMovement(
  baseMovement: string,
): ExerciseTemplate[] {
  return EXERCISE_CATALOG.filter(
    (exercise) => exercise.baseMovement === baseMovement,
  );
}

/**
 * Find an exercise by ID
 */
export function findExerciseById(id: string): ExerciseTemplate | undefined {
  return EXERCISE_CATALOG.find((exercise) => exercise.id === id);
}

/**
 * Get unique categories from catalog
 */
export function getCategories(): ExerciseCategory[] {
  return ["push", "pull", "legs", "core"];
}

/**
 * Get unique training types from catalog
 */
export function getTrainingTypes(): TrainingType[] {
  return ["calisthenics", "weighted", "gym"];
}

/**
 * Display labels for categories
 */
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  core: "Core",
};

/**
 * Display labels for training types
 */
export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  calisthenics: "Calisthenics",
  weighted: "Weighted",
  gym: "Gym",
};
