import { getExerciseImage } from "@/data/exerciseImages";
import { formatDuration } from "@/data/timed-workouts";
import { TimedStep, TimedWorkoutProgram } from "@/types/timed-workout";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// Types
// ============================================

interface TimedWorkoutSessionProps {
  /** The workout program to run */
  program: TimedWorkoutProgram;
  /** Called when workout is completed */
  onComplete: () => void;
  /** Called when workout is cancelled */
  onCancel: () => void;
}

type SessionPhase = "ready" | "countdown" | "running" | "paused" | "complete";

const GET_READY_SECONDS = 3;

// ============================================
// Countdown Circle Display
// ============================================

interface CountdownCircleProps {
  remaining: number;
  total: number;
  isRest: boolean;
}

function CountdownCircle({ remaining, total, isRest }: CountdownCircleProps) {
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const size = 100;
  const borderWidth = 6;
  const innerSize = size - borderWidth * 2;

  // Different colors for exercise vs rest
  const ringColor = isRest ? "#f59e0b" : "#65a30d"; // amber for rest, lime for exercise
  const ringBgColor = isRest
    ? "rgba(245, 158, 11, 0.2)"
    : "rgba(101, 163, 13, 0.2)";
  const bgClass = isRest
    ? "bg-amber-50 dark:bg-amber-900/20"
    : "bg-primary-50 dark:bg-primary-900/20";
  const textClass = isRest ? "text-amber-600" : "text-primary-600";

  return (
    <View className="items-center justify-center">
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
            borderColor: ringBgColor,
          }}
          className="absolute"
        />
        {/* Progress indicator - fades as time passes */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderWidth,
            borderColor: ringColor,
            opacity: 1 - progress / 100,
          }}
          className="absolute"
        />
        {/* Inner circle */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          }}
          className={`${bgClass} items-center justify-center`}
        >
          <Text className={`font-secondarySemiBold text-3xl ${textClass}`}>
            {remaining}
          </Text>
          <Text className={`font-secondary ${textClass} text-xs opacity-70`}>
            sec
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// Step Indicator
// ============================================

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: TimedStep[];
}

function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center px-4 mb-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isRest = step.type === "rest";

        return (
          <View key={index} className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full ${
                isCompleted
                  ? isRest
                    ? "bg-amber-500"
                    : "bg-primary-500"
                  : isCurrent
                    ? isRest
                      ? "bg-amber-500"
                      : "bg-primary-500"
                    : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            {index < steps.length - 1 && (
              <View
                className={`w-3 h-0.5 ${
                  isCompleted
                    ? "bg-primary-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * Follow-along timed workout session component.
 *
 * Auto-advances through exercise and rest steps with countdown timers.
 * Used for workouts like "5 Min Killer Abs".
 */
export function TimedWorkoutSession({
  program,
  onComplete,
  onCancel,
}: TimedWorkoutSessionProps) {
  // ============================================
  // State
  // ============================================
  const [phase, setPhase] = useState<SessionPhase>("ready");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(program.steps[0]?.duration ?? 0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [countdownRemaining, setCountdownRemaining] =
    useState(GET_READY_SECONDS);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const currentStep = program.steps[currentStepIndex];
  const isRest = currentStep?.type === "rest";
  const isLastStep = currentStepIndex === program.steps.length - 1;

  // ============================================
  // Timer Logic
  // ============================================

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;

    if (nextIndex >= program.steps.length) {
      // Workout complete
      clearTimer();
      setPhase("complete");
      onComplete();
      return;
    }

    // Move to next step
    setCurrentStepIndex(nextIndex);
    setRemaining(program.steps[nextIndex].duration);
  }, [currentStepIndex, program.steps, clearTimer, onComplete]);

  // Countdown effect (3-2-1 before workout starts)
  useEffect(() => {
    if (phase !== "countdown") return;

    countdownRef.current = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          // Countdown complete, start workout
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          startTimeRef.current = Date.now();
          setPhase("running");
          return GET_READY_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [phase]);

  // Main timer effect
  useEffect(() => {
    if (phase !== "running") return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Step complete, advance
          advanceToNextStep();
          return 0;
        }
        return prev - 1;
      });

      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearTimer();
  }, [phase, advanceToNextStep, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // ============================================
  // Handlers
  // ============================================

  const handleStart = () => {
    setCountdownRemaining(GET_READY_SECONDS);
    setPhase("countdown");
  };

  const handlePause = () => {
    clearTimer();
    setPhase("paused");
  };

  const handleResume = () => {
    setPhase("running");
  };

  const handleCancel = () => {
    clearTimer();
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    onCancel();
  };

  // ============================================
  // Render: Countdown Phase (Get Ready)
  // ============================================

  if (phase === "countdown") {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-4">
          {/* Get Ready Message */}
          <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white mb-2">
            Get Ready!
          </Text>
          <Text className="font-secondary text-gray-500 mb-8">
            {program.name}
          </Text>

          {/* Countdown Circle */}
          <View className="items-center justify-center">
            <View
              style={{ width: 200, height: 200 }}
              className="items-center justify-center"
            >
              <View
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 8,
                  borderColor: "rgba(101, 163, 13, 0.3)",
                }}
                className="absolute"
              />
              <View
                style={{
                  width: 184,
                  height: 184,
                  borderRadius: 92,
                }}
                className="bg-primary-50 dark:bg-primary-900/20 items-center justify-center"
              >
                <Text className="font-secondarySemiBold text-8xl text-primary-600">
                  {countdownRemaining}
                </Text>
              </View>
            </View>
          </View>

          {/* First exercise preview */}
          <View className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-3">
            <Text className="font-secondary text-gray-500 text-sm text-center">
              First up
            </Text>
            <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center">
              {program.steps[0]?.name} – {program.steps[0]?.duration}s
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // Render: Ready Phase
  // ============================================

  if (phase === "ready") {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 px-4">
          {/* Header */}
          <View className="items-center pt-8 pb-6">
            <Text className="font-secondary text-primary text-sm mb-1">
              Follow Along
            </Text>
            <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white text-center">
              {program.name}
            </Text>
            <Text className="font-secondary text-gray-500 mt-2">
              {formatDuration(program.totalDuration)} total
            </Text>
          </View>

          {/* Workout Preview */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
            <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 mb-3">
              Workout Steps
            </Text>
            {program.steps.map((step, index) => (
              <View
                key={index}
                className="flex-row items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {getExerciseImage(step.image) ? (
                  <Image
                    source={getExerciseImage(step.image)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                    contentFit="contain"
                  />
                ) : (
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                      step.type === "rest"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-primary-100 dark:bg-primary-900/30"
                    }`}
                  >
                    <Text
                      className={`font-secondaryMedium text-xs ${
                        step.type === "rest"
                          ? "text-amber-600"
                          : "text-primary-600"
                      }`}
                    >
                      {index + 1}
                    </Text>
                  </View>
                )}
                <Text
                  className={`flex-1 font-secondary ${
                    step.type === "rest"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {step.name}
                </Text>
                <Text className="font-secondaryMedium text-gray-500">
                  {step.duration}s
                </Text>
              </View>
            ))}
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Actions */}
          <View className="pb-6">
            <Pressable
              onPress={handleStart}
              className="bg-primary rounded-xl py-4 items-center mb-3"
            >
              <Text className="font-secondaryMedium text-lg text-background-dark">
                Start Workout
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCancel}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl py-4 items-center"
            >
              <Text className="font-secondaryMedium text-lg text-gray-600 dark:text-gray-400">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // Render: Running / Paused Phase
  // ============================================

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-secondary text-gray-500 text-sm">
                {program.name}
              </Text>
              <Text className="font-secondaryMedium text-gray-400 text-xs mt-0.5">
                Elapsed: {formatDuration(totalElapsed)}
              </Text>
            </View>
            <Pressable
              onPress={handleCancel}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Progress Indicator */}
        <StepIndicator
          currentStep={currentStepIndex}
          totalSteps={program.steps.length}
          steps={program.steps}
        />

        {/* Previous Exercise Preview */}
        {currentStepIndex > 0 &&
          getExerciseImage(program.steps[currentStepIndex - 1]?.image) && (
            <View className="items-center mb-2 opacity-50">
              <Image
                source={getExerciseImage(
                  program.steps[currentStepIndex - 1]?.image,
                )}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                }}
                contentFit="contain"
              />
              <Text className="font-secondary text-gray-400 text-xs mt-1">
                {program.steps[currentStepIndex - 1]?.name}
              </Text>
            </View>
          )}

        {/* Current Exercise - Dominant Display */}
        <View className="flex-1 items-center justify-center">
          {getExerciseImage(currentStep?.image) && (
            <Image
              source={getExerciseImage(currentStep?.image)}
              style={{
                width: "100%",
                height: "60%",
                borderRadius: 16,
              }}
              contentFit="contain"
            />
          )}
          <Text
            className={`font-primarySemiBold text-xl mt-2 ${
              isRest ? "text-amber-600" : "text-gray-900 dark:text-white"
            }`}
          >
            {currentStep?.name}
          </Text>
          <Text className="font-secondary text-gray-500 text-xs mt-1">
            Step {currentStepIndex + 1} of {program.steps.length}
          </Text>
        </View>

        {/* Timer Display - Compact */}
        <View className="items-center py-2">
          <CountdownCircle
            remaining={remaining}
            total={currentStep?.duration ?? 0}
            isRest={isRest}
          />

          {/* Phase indicator */}
          {phase === "paused" && (
            <View className="mt-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <Text className="font-secondaryMedium text-amber-600 text-sm">
                PAUSED
              </Text>
            </View>
          )}
        </View>

        {/* Next Up Preview */}
        {!isLastStep && (
          <View className="px-4 mb-3">
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex-row items-center">
              {getExerciseImage(program.steps[currentStepIndex + 1]?.image) && (
                <Image
                  source={getExerciseImage(
                    program.steps[currentStepIndex + 1]?.image,
                  )}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    marginRight: 10,
                  }}
                  contentFit="contain"
                />
              )}
              <Text className="font-secondary text-gray-500 mr-2">Next:</Text>
              <Text
                className={`font-secondaryMedium flex-1 ${
                  program.steps[currentStepIndex + 1]?.type === "rest"
                    ? "text-amber-600"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {program.steps[currentStepIndex + 1]?.name}
              </Text>
              <Text className="font-secondary text-gray-500">
                {program.steps[currentStepIndex + 1]?.duration}s
              </Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View className="px-4 pb-6 flex-row gap-3">
          {phase === "running" ? (
            <Pressable
              onPress={handlePause}
              className="flex-1 bg-amber-500 rounded-xl py-4 items-center"
            >
              <Text className="font-secondaryMedium text-lg text-white">
                Pause
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleResume}
              className="flex-1 bg-primary rounded-xl py-4 items-center"
            >
              <Text className="font-secondaryMedium text-lg text-background-dark">
                Resume
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
