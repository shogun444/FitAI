/**
 * Timed Follow-Along Workout Programs
 *
 * These are guided workouts with a sequence of timed exercises
 * and rest periods that auto-advance.
 */

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
    { type: "exercise", name: "Hollow Body Hold", duration: 30 },
    { type: "rest", name: "Rest", duration: 15 },
    { type: "exercise", name: "Legs Up Russian Twist", duration: 30 },
    { type: "rest", name: "Rest", duration: 30 },
    { type: "exercise", name: "Hollow Body Hold", duration: 30 },
    { type: "rest", name: "Rest", duration: 15 },
    { type: "exercise", name: "Legs Up Russian Twist", duration: 30 },
    { type: "rest", name: "Rest", duration: 30 },
    { type: "exercise", name: "Plank", duration: 30 },
    { type: "rest", name: "Rest", duration: 10 },
    { type: "exercise", name: "Hollow Body Hold", duration: 60 },
  ],
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
