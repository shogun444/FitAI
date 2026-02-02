import { PullupProgramExercise } from "@/types/pullup-program";

/**
 * "Unlock Your First Pull-up" Program Definition
 *
 * This is a GUIDED, COACH-LED program.
 * - Exercises are EXCLUSIVE to this program
 * - NOT in the global exercise catalog
 * - Strict order, no skipping
 * - One exercise per session
 */

export const PULLUP_PROGRAM = {
  id: "unlock-first-pullup",
  name: "Unlock Your First Pull-up",
  description:
    "A guided program to help you achieve your first strict pull-up. Follow along with structured exercises designed to build the strength you need.",
  type: "FREE" as const,
  totalExercises: 3,
  sessionsPerExercise: 1, // 1 session (with 5 sets) per exercise
} as const;

/**
 * Program Exercises - STRICT ORDER
 *
 * User must complete sessionsRequired sessions of each exercise
 * before advancing to the next.
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
    targetValue: 8,
    targetUnit: "reps",
    sessionsRequired: 1, // 1 session with 5 sets
    media: undefined, // Placeholder for GIF
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
    sessionsRequired: 1, // 1 session with 5 sets
    media: undefined, // Placeholder for GIF
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
    sessionsRequired: 1, // 1 session with 5 sets
    media: undefined, // Placeholder for GIF
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
