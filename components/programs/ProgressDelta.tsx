import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

interface ProgressDeltaProps {
  previousWeight: number | null;
  currentWeight: number;
  /**
   * Variant controls the display format:
   * - "inline": Styled badge with progress info (during workout)
   * - "transition": "27 kg → 28 kg (+1 kg)" (session summary)
   */
  variant?: "inline" | "transition";
  className?: string;
}

/**
 * ProgressDelta - Displays weight progress since last session.
 *
 * Renders ONLY when:
 * - previousWeight exists (not first session)
 * - delta > 0 (actual progress made)
 *
 * Does NOT render when:
 * - First session (no previous weight)
 * - Weight unchanged (delta === 0)
 * - Weight decreased (edge case, should not happen)
 */
export const ProgressDelta = memo(function ProgressDelta({
  previousWeight,
  currentWeight,
  variant = "inline",
  className = "",
}: ProgressDeltaProps) {
  // Don't render if no previous weight (first session)
  if (previousWeight === null) return null;

  // Calculate delta
  const delta = currentWeight - previousWeight;

  // Don't render if no positive progress
  if (delta <= 0) return null;

  // Inline variant: Styled progress badge
  if (variant === "inline") {
    return (
      <View
        className={`flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-lg px-3 py-2 ${className}`}
      >
        <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
        <Text className="font-secondary text-gray-600 dark:text-gray-300 text-xs">
          Last session:{" "}
          <Text className="font-secondaryMedium text-gray-700 dark:text-gray-200">
            {previousWeight} kg
          </Text>
        </Text>
        <View className="mx-2 h-3 w-px bg-gray-300 dark:bg-gray-600" />
        <View className="flex-row items-center">
          <Ionicons name="trending-up" size={14} color="#65a30d" />
          <Text className="font-secondaryMedium text-primary-700 ml-1 text-xs">
            +{delta} kg
          </Text>
        </View>
      </View>
    );
  }

  // Transition variant: "27 kg → 28 kg (+1 kg)"
  return (
    <View className={`flex-row items-center ${className}`}>
      <Text className="font-secondaryMedium text-gray-400 dark:text-gray-500 text-sm">
        {previousWeight} kg
      </Text>
      <Text className="font-secondary text-gray-300 dark:text-gray-600 text-sm mx-2">
        →
      </Text>
      <Text className="font-secondarySemiBold text-gray-900 dark:text-white text-sm">
        {currentWeight} kg
      </Text>
      <View className="ml-2 flex-row items-center bg-primary/20 dark:bg-primary/30 px-2 py-0.5 rounded-full">
        <Ionicons name="trending-up" size={12} color="#65a30d" />
        <Text className="font-secondaryMedium text-primary ml-1 text-xs">
          +{delta} kg
        </Text>
      </View>
    </View>
  );
});
