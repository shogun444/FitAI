import { Card } from "@/components/ui";
import { LiftPerformance, PerformanceTier, PROGRAM_LIFTS } from "@/types";
import { Text, View } from "react-native";
import { WeightChangeRow } from "./WeightChangeRow";

interface SessionSummaryCardProps {
  performances: LiftPerformance[];
  sessionNumber: number;
}

/**
 * Get tier-specific progression reason copy.
 * Calm, authoritative tone - like a real coach.
 */
function getTierReason(tier: PerformanceTier): string {
  switch (tier) {
    case "A":
      return "You exceeded today's target.";
    case "B":
      return "Strong performance. Solid progression.";
    case "C":
      return "Partial completion. Small increase to build consistency.";
    case "D":
      return "Recovery session. Same weight to consolidate.";
  }
}

/**
 * Displays session summary with weight progressions.
 * Shows after completing a program session.
 *
 * For each lift:
 * - Previous → New weight (+X kg)
 * - Reason based on tier
 */
export function SessionSummaryCard({
  performances,
  sessionNumber,
}: SessionSummaryCardProps) {
  // Calculate total weight increase across all lifts
  const totalDelta = performances.reduce(
    (sum, p) => sum + (p.nextWeight - p.weight),
    0,
  );

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            Session {sessionNumber} Complete
          </Text>
          <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
            Weight adjustments for next session
          </Text>
        </View>
        {totalDelta > 0 && (
          <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
            <Text className="font-primarySemiBold text-primary-700 dark:text-primary-400 text-sm">
              +{totalDelta} kg total
            </Text>
          </View>
        )}
      </View>

      <View className="gap-4">
        {performances.map((perf) => {
          const delta = perf.nextWeight - perf.weight;
          const liftInfo = PROGRAM_LIFTS.find((l) => l.id === perf.liftId);

          return (
            <View
              key={perf.liftId}
              className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0 last:pb-0"
            >
              <WeightChangeRow
                liftId={perf.liftId}
                previousWeight={perf.weight}
                newWeight={perf.nextWeight}
                tier={perf.tier}
              />
              <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs mt-1.5">
                {getTierReason(perf.tier)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
