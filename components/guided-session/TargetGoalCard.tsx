import { Text, View } from "react-native";

interface TargetGoalCardProps {
  /** Target value (e.g., 8 for reps, 30 for seconds) */
  targetValue: number;
  /** Target unit (e.g., "reps", "seconds") */
  targetUnit: string;
}

/**
 * Displays the goal/target for the current exercise.
 *
 * Usage:
 * ```tsx
 * <TargetGoalCard targetValue={8} targetUnit="reps" />
 * ```
 */
export function TargetGoalCard({
  targetValue,
  targetUnit,
}: TargetGoalCardProps) {
  return (
    <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 mb-4">
      <Text className="font-primaryMedium text-gray-900 dark:text-white text-center text-lg">
        Goal: {targetValue} {targetUnit}
      </Text>
    </View>
  );
}
