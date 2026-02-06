import { ExerciseTemplate } from "@/types";

/**
 * Exercise Catalog - Single Source of Truth
 *
 * Schema:
 * - id: Unique identifier (kebab-case)
 * - name: Display name
 * - category: push | pull | legs | core
 * - baseMovement: The fundamental movement pattern
 * - trainingTypes: calisthenics | weighted | gym
 * - allowsExternalLoad: Whether weight can be added
 *
 * Rules:
 * - No duplicate exercises
 * - Programs reference exercises by ID only
 * - Filtering combines category AND trainingType
 */
export const EXERCISE_CATALOG: ExerciseTemplate[] = [
  // ============================================
  // PUSH Exercises
  // ============================================
  {
    id: "bench-press",
    name: "Bench Press",
    category: "push",
    baseMovement: "press",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
    image: "benchpress",
  },
  {
    id: "bodyweight-pushups",
    name: "Bodyweight Push-ups",
    category: "push",
    baseMovement: "pushup",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
    image: "pushups",
  },
  {
    id: "weighted-dips",
    name: "Weighted Dips",
    category: "push",
    baseMovement: "dip",
    trainingTypes: ["weighted"],
    allowsExternalLoad: true,
    image: "weighted-dips",
  },
  {
    id: "bodyweight-dips",
    name: "Bodyweight Dips",
    category: "push",
    baseMovement: "dip",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
    image: "dips",
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "push",
    baseMovement: "press",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
    image: "overheadpress",
  },
  {
    id: "pike-pushups",
    name: "Pike Push-ups",
    category: "push",
    baseMovement: "pushup",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
    image: "pike-pushups",
  },

  // ============================================
  // PULL Exercises
  // ============================================
  {
    id: "bodyweight-pullups",
    name: "Bodyweight Pull-ups",
    category: "pull",
    baseMovement: "pullup",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
    image: "bw-pullups",
  },
  {
    id: "weighted-pullups",
    name: "Weighted Pull-ups",
    category: "pull",
    baseMovement: "pullup",
    trainingTypes: ["weighted"],
    allowsExternalLoad: true,
  },
  {
    id: "barbell-rows",
    name: "Barbell Rows",
    category: "pull",
    baseMovement: "row",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
  },
  {
    id: "inverted-rows",
    name: "Inverted Rows",
    category: "pull",
    baseMovement: "row",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "chin-ups",
    name: "Chin-ups",
    category: "pull",
    baseMovement: "pullup",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },

  // ============================================
  // LEGS Exercises
  // ============================================
  {
    id: "deadlifts",
    name: "Deadlifts",
    category: "legs",
    baseMovement: "hinge",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
    image: "deadlift",
  },
  {
    id: "barbell-squats",
    name: "Barbell Squats",
    category: "legs",
    baseMovement: "squat",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
  },
  {
    id: "bodyweight-squats",
    name: "Bodyweight Squats",
    category: "legs",
    baseMovement: "squat",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "pistol-squats",
    name: "Pistol Squats",
    category: "legs",
    baseMovement: "squat",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "weighted-squats",
    name: "Weighted Squats",
    category: "legs",
    baseMovement: "squat",
    trainingTypes: ["weighted"],
    allowsExternalLoad: true,
  },
  {
    id: "lunges",
    name: "Lunges",
    category: "legs",
    baseMovement: "lunge",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "romanian-deadlifts",
    name: "Romanian Deadlifts",
    category: "legs",
    baseMovement: "hinge",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
  },

  // ============================================
  // CORE Exercises
  // ============================================
  {
    id: "hanging-leg-raises",
    name: "Hanging Leg Raises",
    category: "core",
    baseMovement: "leg-raise",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "plank",
    name: "Plank",
    category: "core",
    baseMovement: "hold",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
    image: "plank",
  },
  {
    id: "l-sit",
    name: "L-Sit",
    category: "core",
    baseMovement: "hold",
    trainingTypes: ["calisthenics"],
    allowsExternalLoad: false,
  },
  {
    id: "ab-wheel-rollout",
    name: "Ab Wheel Rollout",
    category: "core",
    baseMovement: "rollout",
    trainingTypes: ["gym"],
    allowsExternalLoad: false,
  },
  {
    id: "cable-crunches",
    name: "Cable Crunches",
    category: "core",
    baseMovement: "crunch",
    trainingTypes: ["gym"],
    allowsExternalLoad: true,
  },
];
