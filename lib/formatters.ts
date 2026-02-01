/**
 * Shared formatting utilities for consistent display across the app.
 *
 * Domain Standard: WEIGHT → REPS (for weighted exercises)
 * Format: "{weight} kg × {reps}" or "{reps} reps" (bodyweight)
 *
 * This ensures cognitive consistency for users reading workout data.
 */

// ============================================
// Weight × Reps Formatter
// ============================================

interface FormatWeightRepsOptions {
  /** Include "reps" suffix (default: false) */
  showRepsSuffix?: boolean;
  /** Fallback for null/undefined weight (default: 0) */
  defaultWeight?: number;
  /** Fallback for null/undefined reps (default: 0) */
  defaultReps?: number;
  /** If true, format as bodyweight (reps only) */
  isBodyweight?: boolean;
}

/**
 * Formats weight and reps in the standard domain order: WEIGHT → REPS
 * For bodyweight exercises, shows reps only.
 *
 * @example
 * formatWeightReps(30, 5)                          // "30 kg × 5"
 * formatWeightReps(30, 5, { showRepsSuffix: true }) // "30 kg × 5 reps"
 * formatWeightReps(null, null)                     // "0 kg × 0"
 * formatWeightReps(0, 5, { isBodyweight: true })   // "5 reps"
 * formatWeightReps(null, 8, { isBodyweight: true }) // "8 reps"
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
    isBodyweight = false,
  } = options;

  const r = reps ?? defaultReps;

  // Bodyweight exercises: show reps only
  if (isBodyweight) {
    return `${r} reps`;
  }

  const w = weight ?? defaultWeight;

  if (showRepsSuffix) {
    return `${w} kg × ${r} reps`;
  }

  return `${w} kg × ${r}`;
}

/**
 * Formats a "previous performance" display.
 * Standard format: "Prev: {weight} kg × {reps}" or "Prev: {reps} reps" (bodyweight)
 *
 * @example
 * formatPreviousPerformance(27, 5)                      // "Prev: 27 kg × 5"
 * formatPreviousPerformance(0, 10, { isBodyweight: true }) // "Prev: 10 reps"
 */
export function formatPreviousPerformance(
  weight: number | null | undefined,
  reps: number | null | undefined,
  options: { isBodyweight?: boolean } = {},
): string {
  return `Prev: ${formatWeightReps(weight, reps, { isBodyweight: options.isBodyweight })}`;
}

/**
 * Formats a set display for history/summary contexts.
 * Standard format: "Set {n}: {weight} kg × {reps}" or "Set {n}: {reps} reps" (bodyweight)
 *
 * @example
 * formatSetDisplay(1, 30, 5)                          // "Set 1: 30 kg × 5"
 * formatSetDisplay(1, null, 10, { isBodyweight: true }) // "Set 1: 10 reps"
 */
export function formatSetDisplay(
  setNumber: number,
  weight: number | null | undefined,
  reps: number | null | undefined,
  options: { isBodyweight?: boolean } = {},
): string {
  return `Set ${setNumber}: ${formatWeightReps(weight, reps, { isBodyweight: options.isBodyweight })}`;
}
