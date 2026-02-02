import { Heading } from "@/components/ui";
import { Text, View } from "react-native";

interface SessionHeaderProps {
  /** Program name displayed above the exercise */
  programName: string;
  /** Exercise name as the main title */
  exerciseName: string;
  /** Current set number (1-based for display) */
  currentSet: number;
  /** Total number of sets */
  totalSets: number;
}

/**
 * Session header showing program name, exercise name, and set indicator.
 *
 * Usage:
 * ```tsx
 * <SessionHeader
 *   programName="Unlock Your First Pull-up"
 *   exerciseName="Negative Pull-ups"
 *   currentSet={1}
 *   totalSets={5}
 * />
 * ```
 */
export function SessionHeader({
  programName,
  exerciseName,
  currentSet,
  totalSets,
}: SessionHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-2">
      <Text className="font-secondary text-primary text-sm">{programName}</Text>
      <Heading className="text-2xl">{exerciseName}</Heading>
      <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-base mt-1">
        Set {currentSet} of {totalSets}
      </Text>
    </View>
  );
}
