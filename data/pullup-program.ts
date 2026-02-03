import { Program, ProgramAdvice } from "@/data/programs";
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

// ============================================
// Recovery Guidelines
// ============================================

const PULLUP_PROGRAM_ADVICE: ProgramAdvice[] = [
  {
    id: "frequency",
    title: "Training Frequency",
    content:
      "This program is designed for 3-4 sessions per week with at least one rest day between sessions. Your muscles need time to recover and grow stronger. Consistency beats intensity—show up regularly.",
  },
  {
    id: "fatigue",
    title: "Fatigue Management",
    content:
      "Listen to your body. If your grip feels weak or your muscles are still sore, take an extra rest day. Overtraining will slow your progress. Quality reps matter more than quantity.",
  },
  {
    id: "sleep",
    title: "Sleep & Recovery",
    content:
      "Aim for 7-9 hours of sleep per night. Sleep is when your body repairs muscle tissue and builds strength. Poor sleep will directly impact your pull-up progress.",
  },
  {
    id: "protein",
    title: "Protein Intake",
    content:
      "Ensure you're eating enough protein to support muscle growth—aim for 1.6-2.2g per kg of bodyweight daily. Check the Nutrition section to calculate your recommended intake.",
  },
];

/**
 * Program-compatible object for use with ProgramHeader component
 * This allows the pullup program to render using the same intro card
 * as Weighted Calisthenics Strength.
 */
export const PULLUP_PROGRAM_INFO: Program = {
  id: PULLUP_PROGRAM.id,
  name: PULLUP_PROGRAM.name,
  tagline: "Your path to your first pull-up",
  description: PULLUP_PROGRAM.description,
  frequency: "3-4 sessions per week",
  duration: `${PULLUP_PROGRAM.targetSessions} sessions`,
  level: "beginner",
  isPaid: false,
  advice: PULLUP_PROGRAM_ADVICE,
};

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
