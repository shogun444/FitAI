import { UseRestTimerReturn } from "@/hooks/useRestTimer";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// Helpers
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ============================================
// Circular Timer Display
// ============================================

interface CircularTimerDisplayProps {
  /** Remaining time formatted string */
  timeDisplay: string;
  /** Progress value from 0 to 100 */
  progress: number;
  /** Status text to show below time */
  statusText: string;
  /** Size of the circle in pixels */
  size: number;
}

/**
 * Circular timer display with progress ring.
 * Uses View-based approach without external dependencies.
 * Progress is shown as a ring border that "fills" as time passes.
 */
function CircularTimerDisplay({
  timeDisplay,
  progress,
  statusText,
  size,
}: CircularTimerDisplayProps) {
  const borderWidth = 6;
  const innerSize = size - borderWidth * 2;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      {/* Outer ring - background */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borderWidth,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
        className="absolute"
      />
      {/* Progress indicator - uses opacity to show progress */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borderWidth,
          borderColor: "white",
          opacity: 1 - progress / 100,
        }}
        className="absolute"
      />
      {/* Inner circle with content */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
        }}
        className="bg-white/10 items-center justify-center"
      >
        <Text className="font-secondarySemiBold text-6xl text-white">
          {timeDisplay}
        </Text>
        <Text className="font-secondary text-white/70 text-sm mt-2">
          {statusText}
        </Text>
      </View>
    </View>
  );
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

  // Calculate circle size based on screen width
  const screenWidth = Dimensions.get("window").width;
  const circleSize = Math.min(screenWidth - 80, 280);

  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      {/* Close button - top right, below safe area */}
      <View className="flex-row justify-end mx-4 ">
        <Pressable
          onPress={onDismiss}
          className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
      </View>

      {/* Main content - centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Circular timer display */}
        <TouchableOpacity activeOpacity={1} onPress={onDismiss}>
          <CircularTimerDisplay
            timeDisplay={formatTime(remaining)}
            progress={progress}
            statusText={
              isRunning
                ? "Please catch a breath"
                : hasStarted
                  ? "Paused"
                  : `Set to ${formatTime(duration)}`
            }
            size={circleSize}
          />
        </TouchableOpacity>

        {/* Duration adjustment (only when not started) */}
        {!hasStarted && (
          <View className="flex-row items-center justify-center gap-6 mt-8">
            <Pressable
              onPress={decreaseDuration}
              disabled={isAtMinDuration}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                isAtMinDuration ? "bg-white/10" : "bg-white/20"
              }`}
            >
              <Ionicons
                name="remove"
                size={28}
                color={isAtMinDuration ? "rgba(255,255,255,0.3)" : "white"}
              />
            </Pressable>
            <Text className="font-secondaryMedium text-white text-lg w-20 text-center">
              {formatTime(duration)}
            </Text>
            <Pressable
              onPress={increaseDuration}
              disabled={isAtMaxDuration}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                isAtMaxDuration ? "bg-white/10" : "bg-white/20"
              }`}
            >
              <Ionicons
                name="add"
                size={28}
                color={isAtMaxDuration ? "rgba(255,255,255,0.3)" : "white"}
              />
            </Pressable>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View className="px-6 pb-12">
        <View className="flex-row gap-3">
          {isRunning ? (
            <Pressable
              onPress={pause}
              className="flex-1 bg-white/20 rounded-xl py-4"
            >
              <Text className="font-secondaryMedium text-white text-center text-base">
                Pause
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={start}
              className="flex-1 bg-white rounded-xl py-4"
            >
              <Text className="font-secondaryMedium text-primary-600 text-center text-base">
                {hasStarted && remaining < duration ? "Resume" : "Start"}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={reset}
            className="flex-1 bg-white/20 rounded-xl py-4"
          >
            <Text className="font-secondaryMedium text-white text-center text-base">
              Reset
            </Text>
          </Pressable>
        </View>

        {/* Hint text */}
        <Text className="font-secondary text-xs text-white/50 text-center mt-4">
          Tap anywhere or X to minimize • Timer continues running
        </Text>
      </View>
    </SafeAreaView>
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
