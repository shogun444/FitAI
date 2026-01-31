/**
 * Program Rules Engine
 *
 * Centralized, deterministic progression logic.
 * Users pay for authority, not flexibility.
 *
 * LOCKED RULES - Do not modify without CTO approval.
 */

import {
  CalibrationResult,
  LiftCalibration,
  LiftPerformance,
  PerformanceTier,
  ProgramLiftId,
} from "@/types";

// ============================================
// Calibration Rules
// ============================================

/**
 * Calibrate starting weight based on user input.
 *
 * Safety rules:
 * 1. If workingWeight > PR → Clamp to PR
 * 2. If user cannot complete 5 reps → Reduce by 10%
 */
export function calibrateLift(input: LiftCalibration): CalibrationResult {
  let startingWeight = input.workingWeight;
  let adjustmentMessage: string | null = null;

  // Rule 1: Clamp working weight to PR
  if (input.workingWeight > input.prWeight) {
    startingWeight = input.prWeight;
    adjustmentMessage =
      "Starting slightly conservatively improves long-term progress.";
  }

  // Rule 2: Reduce if cannot complete 5 reps
  if (!input.canComplete5Reps) {
    const reduction = Math.round(startingWeight * 0.1); // 10% reduction
    startingWeight = startingWeight - reduction;

    // Combine messages if both rules applied
    if (adjustmentMessage) {
      adjustmentMessage += ` Weight reduced by ${reduction}kg as you indicated difficulty with 5 reps.`;
    } else {
      adjustmentMessage = `Weight reduced by ${reduction}kg to ensure quality sets of 5. Building momentum early leads to better long-term results.`;
    }
  }

  // Ensure minimum weight of 0
  startingWeight = Math.max(0, startingWeight);

  // Round to nearest 0.5kg
  startingWeight = Math.round(startingWeight * 2) / 2;

  return {
    liftId: input.liftId,
    startingWeight,
    adjustmentMessage,
  };
}

// ============================================
// Progression Rules (FINAL, LOCKED)
// ============================================

/**
 * Weight increments per tier.
 */
const PROGRESSION_INCREMENTS: Record<PerformanceTier, number> = {
  A: 5, // Dominant: +5kg
  B: 2, // Solid: +2kg (using 2 instead of 1.5-2 for simplicity)
  C: 1, // Partial: +1kg
  D: 0, // Miss: Same weight
};

/**
 * Tier descriptions for UI.
 */
export const TIER_DESCRIPTIONS: Record<
  PerformanceTier,
  { name: string; description: string }
> = {
  A: {
    name: "Dominant",
    description: "All sets completed with clear reserve",
  },
  B: {
    name: "Solid",
    description: "Nearly all sets completed at max effort",
  },
  C: {
    name: "Partial",
    description: "Majority of sets completed",
  },
  D: {
    name: "Miss",
    description: "Struggled to complete sets",
  },
};

/**
 * Classify performance into a tier.
 *
 * Tier A (Dominant): 5/5 sets OR 4/5 with reserve
 * Tier B (Solid): 4/5 sets near max effort
 * Tier C (Partial): 3/5 sets
 * Tier D (Miss): ≤2 sets
 */
export function classifyPerformance(
  setsCompleted: number,
  feltEasy: boolean,
): PerformanceTier {
  if (setsCompleted >= 5) {
    return "A"; // All sets completed
  }

  if (setsCompleted === 4) {
    return feltEasy ? "A" : "B"; // 4 sets with reserve = A, otherwise B
  }

  if (setsCompleted === 3) {
    return "C"; // Partial
  }

  return "D"; // Miss (≤2 sets)
}

/**
 * Calculate next session weight based on performance.
 */
export function calculateNextWeight(
  currentWeight: number,
  tier: PerformanceTier,
): number {
  const increment = PROGRESSION_INCREMENTS[tier];
  const nextWeight = currentWeight + increment;

  // Round to nearest 0.5kg
  return Math.round(nextWeight * 2) / 2;
}

/**
 * Generate progression message for UI.
 */
export function getProgressionMessage(
  tier: PerformanceTier,
  currentWeight: number,
  nextWeight: number,
): string {
  const increment = nextWeight - currentWeight;

  switch (tier) {
    case "A":
      return `Excellent performance! Weight increases by ${increment}kg next session.`;
    case "B":
      return `Solid effort. Weight increases by ${increment}kg next session.`;
    case "C":
      return `Good work pushing through. Small ${increment}kg increase next session.`;
    case "D":
      return `Recovery session. Weight stays at ${currentWeight}kg to build consistency.`;
  }
}

/**
 * Process lift performance and calculate progression.
 */
export function processLiftPerformance(
  liftId: ProgramLiftId,
  weight: number,
  repsPerSet: number[],
  feltEasy: boolean,
): LiftPerformance {
  // Count sets where all 5 reps were completed
  const setsCompleted = repsPerSet.filter((reps) => reps >= 5).length;

  const tier = classifyPerformance(setsCompleted, feltEasy);
  const nextWeight = calculateNextWeight(weight, tier);
  const progressionMessage = getProgressionMessage(tier, weight, nextWeight);

  return {
    liftId,
    weight,
    setsCompleted,
    repsPerSet,
    feltEasy,
    tier,
    nextWeight,
    progressionMessage,
  };
}

// ============================================
// Validation Rules
// ============================================

/**
 * Validate calibration input.
 */
export function isValidCalibration(input: Partial<LiftCalibration>): boolean {
  if (typeof input.prWeight !== "number" || input.prWeight < 0) return false;
  if (typeof input.workingWeight !== "number" || input.workingWeight < 0)
    return false;
  if (typeof input.canComplete5Reps !== "boolean") return false;

  return true;
}

/**
 * Validate PR is reasonable (not impossibly high).
 */
export function isReasonablePR(liftId: ProgramLiftId, weight: number): boolean {
  // Upper bounds for sanity check (world-class levels)
  const maxPRs: Record<ProgramLiftId, number> = {
    "weighted-pullups": 100, // +100kg is extreme
    "weighted-dips": 150, // +150kg is extreme
    squats: 400, // 400kg is world-class
  };

  return weight <= maxPRs[liftId];
}
