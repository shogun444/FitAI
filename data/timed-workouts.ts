/**
 * Timed Follow-Along Workout Programs
 *
 * These are guided workouts with a sequence of timed exercises
 * and rest periods that auto-advance.
 */

import { Program } from "@/data/programs";
import { TimedWorkoutProgram } from "@/types/timed-workout";

// ============================================
// 5 Min Killer Abs
// ============================================

export const KILLER_ABS_5MIN: TimedWorkoutProgram = {
  id: "killer-abs-5min",
  name: "5 Min Killer Abs",
  description:
    "A quick but intense core workout targeting all areas of your abs. Perfect for finishing a workout or a standalone session.",
  type: "FREE",
  totalDuration: 310, // 5 minutes 10 seconds
  steps: [
    {
      type: "exercise",
      name: "Hollow Body Hold",
      duration: 30,
      image: "hollowbody",
    },
    { type: "rest", name: "Rest", duration: 15 },
    {
      type: "exercise",
      name: "Legs Up Russian Twist",
      duration: 30,
      image: "russian-twist",
    },
    { type: "rest", name: "Rest", duration: 30 },
    {
      type: "exercise",
      name: "Hollow Body Hold",
      duration: 30,
      image: "hollowbody",
    },
    { type: "rest", name: "Rest", duration: 15 },
    {
      type: "exercise",
      name: "Legs Up Russian Twist",
      duration: 30,
      image: "russian-twist",
    },
    { type: "rest", name: "Rest", duration: 30 },
    { type: "exercise", name: "Plank", duration: 30, image: "plank" },
    { type: "rest", name: "Rest", duration: 10 },
    {
      type: "exercise",
      name: "Hollow Body Hold",
      duration: 60,
      image: "hollowbody",
    },
  ],
};

/**
 * Program-compatible object for use with ProgramHeader component
 * This allows timed workouts to render using the same intro card
 * as other programs for visual consistency.
 */
export const KILLER_ABS_5MIN_INFO: Program = {
  id: KILLER_ABS_5MIN.id,
  name: KILLER_ABS_5MIN.name,
  tagline: "Quick & Intense Core Blast",
  description: KILLER_ABS_5MIN.description,
  frequency: "Anytime",
  duration: "5 minutes",
  level: "beginner",
  isPaid: false,
  advice: [],
};

// ============================================
// All Timed Workouts
// ============================================

export const TIMED_WORKOUTS: TimedWorkoutProgram[] = [KILLER_ABS_5MIN];

// ============================================
// Helper Functions
// ============================================

/**
 * Get a timed workout by ID
 */
export function getTimedWorkoutById(
  id: string,
): TimedWorkoutProgram | undefined {
  return TIMED_WORKOUTS.find((w) => w.id === id);
}

/**
 * Format duration from seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate total workout time from steps
 */
export function calculateTotalDuration(
  steps: TimedWorkoutProgram["steps"],
): number {
  return steps.reduce((total, step) => total + step.duration, 0);
}
