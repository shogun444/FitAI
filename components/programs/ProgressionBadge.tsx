import { PerformanceTier } from "@/types";
import { Text, View } from "react-native";

interface ProgressionBadgeProps {
  delta: number;
  tier?: PerformanceTier;
  className?: string;
}

/**
 * Displays weight progression as a badge.
 * Shows "+X kg" for increases, "Maintain" for no change.
 *
 * Used in:
 * - Session summary (after workout)
 * - ActiveProgramCard (before next workout)
 */
export function ProgressionBadge({
  delta,
  tier,
  className = "",
}: ProgressionBadgeProps) {
  const hasIncrease = delta > 0;

  if (!hasIncrease) {
    return (
      <View
        className={`bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full ${className}`}
      >
        <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 text-xs">
          Maintain
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-full ${className}`}
    >
      <Text className="font-secondaryMedium text-primary-700 dark:text-primary-400 text-xs">
        +{delta} kg
      </Text>
    </View>
  );
}
