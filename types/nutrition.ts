/**
 * Nutrition Calculator Types and Logic
 *
 * SCOPE: Educational protein calculator for muscle building.
 * NOT: Food tracking, calorie counting, meal planning.
 *
 * Calculation rules:
 * - BMI = weight / (height_in_meters ^ 2)
 * - Protein based on bodyweight × multiplier (goal-dependent)
 * - Max protein cap: 1.4 × bodyweight (never exceed)
 */

export type FitnessGoal = "maintain" | "build_muscle" | "fat_loss";

export interface NutritionInput {
  weight: number; // kg
  height: number; // cm
  age: number; // years
  goal: FitnessGoal;
}

export interface ProteinRange {
  min: number; // grams per day
  max: number; // grams per day
}

export interface NutritionResult {
  bmi: number;
  bmiCategory: string;
  proteinRange: ProteinRange;
}

// ============================================
// Protein multipliers by goal
// ============================================

const PROTEIN_MULTIPLIERS: Record<FitnessGoal, { min: number; max: number }> = {
  maintain: { min: 1.0, max: 1.2 },
  build_muscle: { min: 1.2, max: 1.4 },
  fat_loss: { min: 1.2, max: 1.4 },
};

// Absolute cap - never recommend above this
const MAX_PROTEIN_MULTIPLIER = 1.4;

// ============================================
// BMI Calculation
// ============================================

/**
 * Calculate BMI from weight and height.
 * BMI = weight (kg) / height (m)^2
 */
export function calculateBMI(weight: number, heightCm: number): number {
  if (weight <= 0 || heightCm <= 0) return 0;

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI category for display.
 * Note: BMI is a rough indicator and does not reflect muscle mass.
 */
export function getBMICategory(bmi: number): string {
  if (bmi <= 0) return "—";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ============================================
// Protein Calculation
// ============================================

/**
 * Calculate protein range based on bodyweight and fitness goal.
 *
 * Rules:
 * - Maintain: 1.0 – 1.2 × bodyweight
 * - Build Muscle: 1.2 – 1.4 × bodyweight
 * - Fat Loss: 1.2 – 1.4 × bodyweight
 * - Never exceed 1.4 × bodyweight
 */
export function calculateProteinRange(
  weight: number,
  goal: FitnessGoal,
): ProteinRange {
  if (weight <= 0) {
    return { min: 0, max: 0 };
  }

  const multipliers = PROTEIN_MULTIPLIERS[goal];

  // Calculate range, respecting absolute cap
  const min = Math.round(weight * multipliers.min);
  const max = Math.round(
    weight * Math.min(multipliers.max, MAX_PROTEIN_MULTIPLIER),
  );

  return { min, max };
}

// ============================================
// Combined Calculation
// ============================================

/**
 * Calculate all nutrition metrics from user input.
 * Returns null if input is invalid.
 */
export function calculateNutrition(
  input: NutritionInput,
): NutritionResult | null {
  const { weight, height, goal } = input;

  // Validate input
  if (weight <= 0 || height <= 0) {
    return null;
  }

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const proteinRange = calculateProteinRange(weight, goal);

  return {
    bmi,
    bmiCategory,
    proteinRange,
  };
}

// ============================================
// Input Validation
// ============================================

/**
 * Check if nutrition input is valid for calculation.
 */
export function isValidNutritionInput(input: Partial<NutritionInput>): boolean {
  const { weight, height, age, goal } = input;

  return (
    typeof weight === "number" &&
    weight > 0 &&
    weight < 500 && // Reasonable upper bound
    typeof height === "number" &&
    height > 0 &&
    height < 300 && // Reasonable upper bound
    typeof age === "number" &&
    age > 0 &&
    age < 150 && // Reasonable upper bound
    !!goal
  );
}

// ============================================
// Display Helpers
// ============================================

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  maintain: "Maintain",
  build_muscle: "Build Muscle",
  fat_loss: "Fat Loss",
};

export const GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: "maintain", label: "Maintain" },
  { value: "build_muscle", label: "Build Muscle" },
  { value: "fat_loss", label: "Fat Loss" },
];
