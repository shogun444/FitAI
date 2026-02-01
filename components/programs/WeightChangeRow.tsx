import { PerformanceTier, PROGRAM_LIFTS, ProgramLiftId } from "@/types";
import { Text, View } from "react-native";
import { ProgressionBadge } from "./ProgressionBadge";

interface WeightChangeRowProps {
  liftId: ProgramLiftId;
  previousWeight: number;
  newWeight: number;
  tier: PerformanceTier;
  showLiftName?: boolean;
  className?: string;
}

/**
 * Displays weight transition for a lift.
 * Format: "30 kg → 35 kg (+5 kg)"
 *
 * Visual hierarchy:
 * - Previous weight: muted
 * - Arrow: subtle
 * - New weight: emphasized
 * - Delta badge: clear but not flashy
 */
export function WeightChangeRow({
  liftId,
  previousWeight,
  newWeight,
  tier,
  showLiftName = true,
  className = "",
}: WeightChangeRowProps) {
  const delta = newWeight - previousWeight;
  const liftInfo = PROGRAM_LIFTS.find((l) => l.id === liftId);
  const liftName = liftInfo?.name ?? liftId;

  return (
    <View className={`${className}`}>
      {showLiftName && (
        <Text className="font-secondaryMedium text-gray-900 dark:text-white text-sm mb-1">
          {liftName}
        </Text>
      )}
      <View className="flex-row items-center">
        {/* Previous weight - muted */}
        <Text className="font-secondaryMedium text-gray-400 dark:text-gray-500 text-sm">
          {previousWeight} kg
        </Text>

        {/* Arrow - subtle */}
        <Text className="font-secondary text-gray-300 dark:text-gray-600 text-sm mx-2">
          →
        </Text>

        {/* New weight - emphasized */}
        <Text className="font-secondarySemiBold text-gray-900 dark:text-white text-sm">
          {newWeight} kg
        </Text>

        {/* Delta badge */}
        <ProgressionBadge delta={delta} tier={tier} className="ml-2" />
      </View>
    </View>
  );
}
