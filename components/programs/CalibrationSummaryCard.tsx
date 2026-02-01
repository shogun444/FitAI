import { Card } from "@/components/ui";
import { CalibrationResult, PROGRAM_LIFTS } from "@/types";
import { Text, View } from "react-native";

interface CalibrationSummaryCardProps {
  results: CalibrationResult[];
}

/**
 * Displays calibration results with any adjustments made.
 */
export function CalibrationSummaryCard({
  results,
}: CalibrationSummaryCardProps) {
  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1">
        Starting Weights
      </Text>
      <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-4">
        Your calibrated weights for session 1
      </Text>

      <View className="gap-4">
        {results.map((result) => {
          const lift = PROGRAM_LIFTS.find((l) => l.id === result.liftId)!;
          return (
            <View
              key={result.liftId}
              className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0 last:pb-0"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-secondaryMedium text-gray-900 dark:text-white text-base">
                  {lift.name}
                </Text>
                <Text className="font-secondarySemiBold text-primary-600 text-lg">
                  {result.startingWeight} kg
                </Text>
              </View>
              {result.adjustmentMessage && (
                <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs">
                  {result.adjustmentMessage}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}
