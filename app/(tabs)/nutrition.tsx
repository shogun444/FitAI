import {
  NutritionResultCard,
  ProteinCalculatorCard,
  ProteinFoodList,
} from "@/components/nutrition";
import { Heading, Subheading } from "@/components/ui";
import {
  calculateNutrition,
  FitnessGoal,
  isValidNutritionInput,
  NutritionResult,
} from "@/types";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Nutrition Screen - Educational protein calculator.
 *
 * SCOPE:
 * - Calculator for protein needs based on bodyweight and goal
 * - BMI display with disclaimer
 * - Static food education list
 *
 * NOT IN SCOPE:
 * - Food tracking
 * - Calorie counting
 * - Meal planning
 * - Data persistence
 */
export default function NutritionScreen() {
  // Input state (strings for proper input handling)
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState<FitnessGoal | null>(null);

  // Whey protein toggle (display only, not persisted)
  const [usesWheyProtein, setUsesWheyProtein] = useState(false);

  // Parse inputs and calculate result
  const result: NutritionResult | null = useMemo(() => {
    if (!goal) return null;

    const input = {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      age: parseFloat(age) || 0,
      goal: goal,
    };

    if (!isValidNutritionInput(input)) {
      return null;
    }

    return calculateNutrition(input);
  }, [weight, height, age, goal]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-6 pb-8">
          <Heading className="mb-2">Nutrition</Heading>
          <Subheading className="mb-6">
            Understand your protein needs for muscle building
          </Subheading>

          {/* Calculator Input */}
          <ProteinCalculatorCard
            weight={weight}
            height={height}
            age={age}
            goal={goal}
            onWeightChange={setWeight}
            onHeightChange={setHeight}
            onAgeChange={setAge}
            onGoalChange={setGoal}
          />

          {/* Results - shown when valid input */}
          {result && <NutritionResultCard result={result} />}

          {/* Food Education - always shown */}
          <ProteinFoodList
            usesWheyProtein={usesWheyProtein}
            onWheyProteinChange={setUsesWheyProtein}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
