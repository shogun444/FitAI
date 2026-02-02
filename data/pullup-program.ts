import { PullupProgramExercise } from "@/types/pullup-program";

/**
 * "Unlock Your First Pull-up" Program Definition
 *
 * NEW MODEL (v2):
 * - Every session includes ALL exercises
 * - Program completes after targetSessions (default: 20)
 * - Builds strength through repeated full sessions
 */

export const PULLUP_PROGRAM = {
  id: "unlock-first-pullup",
  name: "Unlock Your First Pull-up",
  description:
    "A guided program to help you achieve your first strict pull-up. Complete full sessions with all exercises to build the strength you need.",
  type: "FREE" as const,
  targetSessions: 20, // Total sessions to complete the program
} as const;

/**
 * Program Exercises - ALL performed every session
 *
 * User completes all exercises in order each session.
 * Each exercise has a set count per session.
 */
export const PULLUP_PROGRAM_EXERCISES: PullupProgramExercise[] = [
  {
    id: "negative-pullups",
    name: "Negative Pull-ups",
    instructions: [
      "Jump to the top position of a pull-up",
      "Hold at the top as long as possible",
      "Lower yourself slowly with maximum control",
      "Focus on a 3-5 second descent",
    ],
    targetType: "reps",
    targetValue: 5,
    targetUnit: "reps",
    setsPerSession: 3,
    media: undefined,
  },
  {
    id: "inverted-rows",
    name: "Inverted Rows",
    instructions: [
      "Pull your chest to the bar with controlled form",
      "Keep body straight and core engaged",
      "Squeeze shoulder blades together at the top",
      "Lower with control, don't drop",
    ],
    targetType: "reps",
    targetValue: 8,
    targetUnit: "reps",
    setsPerSession: 3,
    media: undefined,
  },
  {
    id: "dead-hangs",
    name: "Dead Hangs",
    instructions: [
      "Hang from the bar with shoulders engaged",
      "Do not shrug - keep shoulders down and back",
      "Grip firmly, breathe steadily",
      "Build up time gradually",
    ],
    targetType: "time",
    targetValue: 30,
    targetUnit: "seconds",
    setsPerSession: 3,
    media: undefined,
  },
];

/**
 * Get exercise by ID
 */
export function getPullupExerciseById(
  id: string,
): PullupProgramExercise | undefined {
  return PULLUP_PROGRAM_EXERCISES.find((e) => e.id === id);
}

/**
 * Get exercise by index
 */
export function getPullupExerciseByIndex(
  index: number,
): PullupProgramExercise | undefined {
  return PULLUP_PROGRAM_EXERCISES[index];
}

/**
 * Get total number of exercises in the program
 */
export function getTotalExercises(): number {
  return PULLUP_PROGRAM_EXERCISES.length;
}
