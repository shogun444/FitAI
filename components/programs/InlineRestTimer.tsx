import { UseRestTimerReturn } from "@/hooks/useRestTimer";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// ============================================
// Types
// ============================================

interface InlineRestTimerProps {
  /** Rest timer state and actions from useRestTimer hook */
  timer: UseRestTimerReturn;
  /** Called when user taps to expand to full modal */
  onExpand: () => void;
}

/**
 * Inline rest timer for workout screens.
 *
 * Renders BELOW the header, ABOVE workout content.
 * Designed to be contextual and non-intrusive.
 *
 * Behavior:
 * - Shows when timer is running or paused with time remaining
 * - Collapses cleanly when not active (returns null)
 * - Compact single-row layout
 * - No shadows, no absolute positioning
 *
 * Memoized to prevent re-renders from parent state changes.
 */
export const InlineRestTimer = memo(function InlineRestTimer({
  timer,
  onExpand,
}: InlineRestTimerProps) {
  const { isRunning, hasStarted, remaining, formattedTime, pause, start } =
    timer;

  // Collapse when timer hasn't started or is complete
  if (!hasStarted || remaining === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onExpand}
      activeOpacity={0.9}
      className="flex-row items-center bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-3 mb-4"
    >
      {/* Timer icon */}
      <View className="w-9 h-9 rounded-full bg-primary-500 items-center justify-center mr-3">
        <Ionicons
          name={isRunning ? "timer" : "pause"}
          size={18}
          color="white"
        />
      </View>

      {/* Time display */}
      <View className="flex-1">
        <Text className="font-secondarySemiBold text-primary-600 dark:text-primary-400 text-xl">
          {formattedTime}
        </Text>
        <Text className="font-secondary text-primary-500/70 dark:text-primary-400/70 text-xs">
          {isRunning ? "Resting..." : "Paused – tap to resume"}
        </Text>
      </View>

      {/* Quick controls */}
      <View className="flex-row items-center gap-2">
        {/* Pause/Resume button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            isRunning ? pause() : start();
          }}
          className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800/50 items-center justify-center"
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={18}
            color="#7c3aed"
          />
        </TouchableOpacity>

        {/* Expand hint */}
        <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800/50 items-center justify-center">
          <Ionicons name="expand" size={16} color="#7c3aed" />
        </View>
      </View>
    </TouchableOpacity>
  );
});
