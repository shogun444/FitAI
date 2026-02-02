import { Button } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ExerciseMedia } from "./ExerciseMedia";
import { FormCuesCard } from "./FormCuesCard";
import { SessionHeader } from "./SessionHeader";

// ============================================
// Types
// ============================================

interface CompletedSet {
  setIndex: number;
  timeCompleted?: number;
}

interface TimeExerciseSessionProps {
  /** Program name displayed in header */
  programName: string;
  /** Exercise name displayed in header */
  exerciseName: string;
  /** Form cues / instructions */
  formCues: string[];
  /** Default duration in seconds */
  defaultDuration: number;
  /** Allowed duration options in seconds */
  allowedDurations: number[];
  /** Current set number (1-based) */
  currentSet: number;
  /** Total number of sets */
  totalSets: number;
  /** Whether this is the last set of the session */
  isLastSet: boolean;
  /** Target time to display as goal */
  targetTime?: number;
  /** Media placeholder */
  media?: string;
  /** Previously completed sets to display */
  completedSets?: CompletedSet[];
  /** Called when set is completed with time in seconds */
  onComplete: (timeCompleted: number) => void;
  /** Called when session is cancelled */
  onCancel: () => void;
}

// ============================================
// Timer States
// ============================================

type TimerPhase = "select" | "countdown" | "input";

// ============================================
// Duration Selector Button
// ============================================

interface DurationButtonProps {
  duration: number;
  isSelected: boolean;
  onPress: () => void;
}

function DurationButton({
  duration,
  isSelected,
  onPress,
}: DurationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 rounded-xl mr-2 mb-2 ${
        isSelected ? "bg-primary-500" : "bg-gray-100 dark:bg-gray-800"
      }`}
    >
      <Text
        className={`font-secondaryMedium text-base ${
          isSelected ? "text-white" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {duration}s
      </Text>
    </Pressable>
  );
}

// ============================================
// Countdown Timer Display
// ============================================

interface CountdownDisplayProps {
  remaining: number;
  total: number;
}

function CountdownDisplay({ remaining, total }: CountdownDisplayProps) {
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const size = 220;
  const borderWidth = 8;
  const innerSize = size - borderWidth * 2;

  return (
    <View className="items-center justify-center py-8">
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
            borderColor: "rgba(101, 163, 13, 0.2)",
          }}
          className="absolute"
        />
        {/* Progress indicator */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderWidth,
            borderColor: "#65a30d",
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
          className="bg-primary-50 dark:bg-primary-900/20 items-center justify-center"
        >
          <Text className="font-secondarySemiBold text-7xl text-primary-600">
            {remaining}
          </Text>
          <Text className="font-secondary text-primary-600/70 text-lg mt-1">
            seconds
          </Text>
        </View>
      </View>
      <Text className="font-secondary text-gray-500 mt-4">
        Hold the position...
      </Text>
    </View>
  );
}

// ============================================
// Time Exercise Session Component
// ============================================

/**
 * Reusable component for time-based guided exercises.
 *
 * Flow:
 * 1. User selects duration from allowed options
 * 2. User taps "Start Timer"
 * 3. Countdown timer runs
 * 4. When timer reaches 0, user enters actual time completed
 * 5. onComplete is called with the entered time
 *
 * This component does NOT auto-complete sets.
 * User must always enter their actual completed time (honest tracking).
 */
export function TimeExerciseSession({
  programName,
  exerciseName,
  formCues,
  defaultDuration,
  allowedDurations,
  currentSet,
  totalSets,
  isLastSet,
  targetTime,
  media,
  completedSets = [],
  onComplete,
  onCancel,
}: TimeExerciseSessionProps) {
  // ============================================
  // State
  // ============================================
  const [phase, setPhase] = useState<TimerPhase>("select");
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [remaining, setRemaining] = useState(defaultDuration);
  const [completedTimeInput, setCompletedTimeInput] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // Timer Logic
  // ============================================

  const startTimer = useCallback(() => {
    setRemaining(selectedDuration);
    setPhase("countdown");
  }, [selectedDuration]);

  // Countdown effect
  useEffect(() => {
    if (phase === "countdown" && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            // Timer complete - move to input phase
            setPhase("input");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, remaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ============================================
  // Handlers
  // ============================================

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleCompletedTimeChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, "");
    setCompletedTimeInput(numericText);
  };

  const handleSubmitTime = () => {
    const time = parseInt(completedTimeInput, 10);
    if (isNaN(time) || time < 0) return;

    // Reset state for next set
    setPhase("select");
    setCompletedTimeInput("");
    setRemaining(selectedDuration);

    onComplete(time);
  };

  const canSubmit =
    completedTimeInput.length > 0 && parseInt(completedTimeInput, 10) >= 0;

  // ============================================
  // Render: Selection Phase
  // ============================================

  if (phase === "select") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <SessionHeader
              programName={programName}
              exerciseName={exerciseName}
              currentSet={currentSet}
              totalSets={totalSets}
            />

            {/* Media */}
            <ExerciseMedia media={media} />

            {/* Form Cues */}
            <FormCuesCard instructions={formCues} />

            {/* Target Goal - shows selected duration */}
            <View className="px-4 mb-4">
              <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex-row items-center">
                <Ionicons name="timer-outline" size={24} color="#65a30d" />
                <View className="ml-3">
                  <Text className="font-secondary text-gray-500 text-sm">
                    Target
                  </Text>
                  <Text className="font-primarySemiBold text-primary-600 text-lg">
                    {selectedDuration} seconds
                  </Text>
                </View>
              </View>
            </View>

            {/* Completed Sets */}
            {completedSets.length > 0 && (
              <View className="px-4 mb-4">
                <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 mb-2">
                  Completed Sets
                </Text>
                <View className="flex-row flex-wrap">
                  {completedSets.map((set, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mr-2 mb-2"
                    >
                      <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300">
                        Set {set.setIndex + 1}: {set.timeCompleted ?? 0}s
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Spacer */}
            <View className="flex-1" />

            {/* Duration Selector */}
            <View className="px-4 pb-4">
              <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 mb-3">
                Select timer duration:
              </Text>
              <View className="flex-row flex-wrap">
                {allowedDurations.map((duration) => (
                  <DurationButton
                    key={duration}
                    duration={duration}
                    isSelected={selectedDuration === duration}
                    onPress={() => handleDurationSelect(duration)}
                  />
                ))}
              </View>
            </View>

            {/* Actions */}
            <View className="px-4 pb-6">
              <Button title="Start Timer" onPress={startTimer} />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={onCancel}
                className="mt-3"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // ============================================
  // Render: Countdown Phase
  // ============================================

  if (phase === "countdown") {
    return (
      <View className="flex-1">
        {/* Header */}
        <SessionHeader
          programName={programName}
          exerciseName={exerciseName}
          currentSet={currentSet}
          totalSets={totalSets}
        />

        {/* Countdown Display */}
        <View className="flex-1 items-center justify-center">
          <CountdownDisplay remaining={remaining} total={selectedDuration} />
        </View>

        {/* Form Cues - Brief reminder */}
        <View className="px-4 pb-6">
          <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-center">
              {formCues[0] || "Hold the position with proper form"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ============================================
  // Render: Input Phase (after timer completes)
  // ============================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <SessionHeader
            programName={programName}
            exerciseName={exerciseName}
            currentSet={currentSet}
            totalSets={totalSets}
          />

          {/* Timer Complete Message */}
          <View className="items-center py-8">
            <View className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#65a30d" />
            </View>
            <Text className="font-primarySemiBold text-2xl text-gray-900 dark:text-white">
              Time's Up!
            </Text>
            <Text className="font-secondary text-gray-500 mt-1">
              Timer ran for {selectedDuration} seconds
            </Text>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Time Input */}
          <View className="px-4 pb-4">
            <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 mb-2 text-center">
              How long did you actually hold? (seconds)
            </Text>
            <TextInput
              value={completedTimeInput}
              onChangeText={handleCompletedTimeChange}
              keyboardType="number-pad"
              placeholder={selectedDuration.toString()}
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-center font-secondarySemiBold text-3xl text-gray-900 dark:text-white"
              autoFocus
              selectTextOnFocus
            />
            <Text className="font-secondary text-gray-400 text-center mt-1">
              seconds
            </Text>
          </View>

          {/* Actions */}
          <View className="px-4 pb-6">
            <Button
              title={isLastSet ? "Complete Set & Finish" : "Save & Next Set"}
              onPress={handleSubmitTime}
              disabled={!canSubmit}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
