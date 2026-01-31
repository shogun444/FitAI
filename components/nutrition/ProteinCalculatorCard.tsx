import { Card, NumberInput, SelectGroup } from "@/components/ui";
import { FitnessGoal, GOAL_OPTIONS } from "@/types";
import { Text, View } from "react-native";

interface ProteinCalculatorCardProps {
  weight: string;
  height: string;
  age: string;
  goal: FitnessGoal | null;
  onWeightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onGoalChange: (value: FitnessGoal) => void;
}

/**
 * Input card for protein calculator.
 * Collects: weight, height, age, and fitness goal.
 */
export function ProteinCalculatorCard({
  weight,
  height,
  age,
  goal,
  onWeightChange,
  onHeightChange,
  onAgeChange,
  onGoalChange,
}: ProteinCalculatorCardProps) {
  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4">
        Your Details
      </Text>

      <View className="gap-4">
        <NumberInput
          label="Weight"
          value={weight}
          onChangeText={onWeightChange}
          placeholder="e.g. 65"
          unit="kg"
        />

        <NumberInput
          label="Height"
          value={height}
          onChangeText={onHeightChange}
          placeholder="e.g. 170"
          unit="cm"
        />

        <NumberInput
          label="Age"
          value={age}
          onChangeText={onAgeChange}
          placeholder="e.g. 25"
          unit="years"
        />

        <SelectGroup
          label="Fitness Goal"
          options={GOAL_OPTIONS}
          value={goal}
          onChange={onGoalChange}
        />
      </View>
    </Card>
  );
}
