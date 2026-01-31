/**
 * Shared formatting utilities for consistent display across the app.
 *
 * Domain Standard: WEIGHT → REPS
 * Format: "{weight} kg × {reps}"
 *
 * This ensures cognitive consistency for users reading workout data.
 */

// ============================================
// Weight × Reps Formatter
// ============================================

interface FormatWeightRepsOptions {
  /** Include "reps" suffix (default: true) */
  showRepsSuffix?: boolean;
  /** Fallback for null/undefined weight (default: 0) */
  defaultWeight?: number;
  /** Fallback for null/undefined reps (default: 0) */
  defaultReps?: number;
}

/**
 * Formats weight and reps in the standard domain order: WEIGHT → REPS
 *
 * @example
 * formatWeightReps(30, 5)           // "30 kg × 5"
 * formatWeightReps(30, 5, { showRepsSuffix: true })  // "30 kg × 5 reps"
 * formatWeightReps(null, null)      // "0 kg × 0"
 * formatWeightReps(0, 0)            // "0 kg × 0"
 */
export function formatWeightReps(
  weight: number | null | undefined,
  reps: number | null | undefined,
  options: FormatWeightRepsOptions = {},
): string {
  const {
    showRepsSuffix = false,
    defaultWeight = 0,
    defaultReps = 0,
  } = options;

  const w = weight ?? defaultWeight;
  const r = reps ?? defaultReps;

  if (showRepsSuffix) {
    return `${w} kg × ${r} reps`;
  }

  return `${w} kg × ${r}`;
}

/**
 * Formats a "previous performance" display.
 * Standard format: "Prev: {weight} kg × {reps}"
 *
 * @example
 * formatPreviousPerformance(27, 5)  // "Prev: 27 kg × 5"
 */
export function formatPreviousPerformance(
  weight: number | null | undefined,
  reps: number | null | undefined,
): string {
  return `Prev: ${formatWeightReps(weight, reps)}`;
}

/**
 * Formats a set display for history/summary contexts.
 * Standard format: "Set {n}: {weight} kg × {reps}"
 *
 * @example
 * formatSetDisplay(1, 30, 5)  // "Set 1: 30 kg × 5"
 */
export function formatSetDisplay(
  setNumber: number,
  weight: number | null | undefined,
  reps: number | null | undefined,
): string {
  return `Set ${setNumber}: ${formatWeightReps(weight, reps)}`;
}
