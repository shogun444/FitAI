import { UseRestTimerReturn } from "@/hooks/useRestTimer";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

// ============================================
// Helpers
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ============================================
// Types
// ============================================

interface ProgramRestTimerProps {
  /** Rest timer state and actions from useRestTimer hook */
  timer: UseRestTimerReturn;
  /** Called when user dismisses the modal (does NOT stop timer) */
  onDismiss: () => void;
}

/**
 * Rest timer modal for program workouts.
 *
 * IMPORTANT: This component does NOT own timer state.
 * Timer state lives in useRestTimer hook (parent).
 *
 * This modal is:
 * - DISMISSIBLE (tap backdrop or back button)
 * - NON-BLOCKING (timer continues when dismissed)
 * - A CONTROLLER (sets duration, starts timer)
 *
 * Default: 5:00 minutes
 * Range: 2:00 – 7:00
 */
export function ProgramRestTimer({ timer, onDismiss }: ProgramRestTimerProps) {
  const {
    duration,
    remaining,
    isRunning,
    hasStarted,
    start,
    pause,
    reset,
    increaseDuration,
    decreaseDuration,
    progress,
    isAtMinDuration,
    isAtMaxDuration,
  } = timer;

  return (
    <View className="flex-1 justify-center">
      {/* Backdrop - tap to dismiss (does NOT stop timer) */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onDismiss}
        className="absolute inset-0 bg-gray-900/80"
      />

      {/* Modal content */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-4 shadow-lg">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            Rest Timer
          </Text>
          <Pressable
            onPress={onDismiss}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <Text className="font-secondaryMedium text-sm text-gray-600 dark:text-gray-300">
              {isRunning ? "Minimize" : "Close"}
            </Text>
          </Pressable>
        </View>

        {/* Timer display */}
        <View className="items-center mb-6">
          <Text className="font-secondarySemiBold text-6xl text-primary-600">
            {formatTime(remaining)}
          </Text>
          <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isRunning
              ? "Resting... (tap outside to minimize)"
              : `Set to ${formatTime(duration)}`}
          </Text>
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
          <View
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Duration adjustment (only when not started) */}
        {!hasStarted && (
          <View className="flex-row items-center justify-center gap-4 mb-6">
            <Pressable
              onPress={decreaseDuration}
              disabled={isAtMinDuration}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isAtMinDuration
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name="remove"
                size={24}
                color={isAtMinDuration ? "#d1d5db" : "#6b7280"}
              />
            </Pressable>
            <Text className="font-secondaryMedium text-gray-600 dark:text-gray-300 text-sm w-16 text-center">
              {formatTime(duration)}
            </Text>
            <Pressable
              onPress={increaseDuration}
              disabled={isAtMaxDuration}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isAtMaxDuration
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name="add"
                size={24}
                color={isAtMaxDuration ? "#d1d5db" : "#6b7280"}
              />
            </Pressable>
          </View>
        )}

        {/* Control buttons */}
        <View className="flex-row gap-3">
          {isRunning ? (
            <Pressable
              onPress={pause}
              className="flex-1 bg-yellow-500 rounded-xl py-3.5"
            >
              <Text className="font-secondaryMedium text-white text-center text-base">
                Pause
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={start}
              className="flex-1 bg-primary-500 rounded-xl py-3.5"
            >
              <Text className="font-secondaryMedium text-white text-center text-base">
                {hasStarted && remaining < duration ? "Resume" : "Start"}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={reset}
            className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3.5"
          >
            <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center text-base">
              Reset
            </Text>
          </Pressable>
        </View>

        {/* Hint text */}
        <Text className="font-secondary text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          Timer continues running when minimized
        </Text>
      </View>
    </View>
  );
}

// ============================================
// Compact Rest Timer Indicator
// ============================================

interface RestTimerIndicatorProps {
  /** Rest timer state and actions from useRestTimer hook */
  timer: UseRestTimerReturn;
  /** Called when user taps to expand to full modal */
  onExpand: () => void;
}

/**
 * Compact rest timer indicator shown on main workout screen.
 *
 * Displayed when:
 * - Timer is running OR
 * - Timer has started (paused with time remaining)
 *
 * Provides:
 * - Time display
 * - Pause/Resume control
 * - Expand to full modal
 */
export function RestTimerIndicator({
  timer,
  onExpand,
}: RestTimerIndicatorProps) {
  const { isRunning, hasStarted, remaining, formattedTime, pause, start } =
    timer;

  // Don't show if timer hasn't started or is complete
  if (!hasStarted || remaining === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onExpand}
      activeOpacity={0.8}
      className="flex-row items-center bg-primary-500 rounded-xl px-4 py-3 mx-4 mb-4 shadow-sm"
    >
      {/* Timer icon */}
      <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
        <Ionicons
          name={isRunning ? "timer" : "pause"}
          size={18}
          color="white"
        />
      </View>

      {/* Time display */}
      <View className="flex-1">
        <Text className="font-secondarySemiBold text-white text-xl">
          {formattedTime}
        </Text>
        <Text className="font-secondary text-white/80 text-xs">
          {isRunning ? "Resting..." : "Paused"}
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
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={20}
            color="white"
          />
        </TouchableOpacity>

        {/* Expand button */}
        <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
          <Ionicons name="expand" size={18} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
