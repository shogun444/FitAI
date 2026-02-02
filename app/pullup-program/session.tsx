import {
  CancelWorkoutModal,
  CompletedSetsList,
  ExerciseMedia,
  FormCuesCard,
  SessionActions,
  SessionHeader,
  SetInput,
  TargetGoalCard,
} from "@/components";
import { InlineRestTimer } from "@/components/programs";
import { useGlobalRestTimer } from "@/contexts/RestTimerContext";
import { PULLUP_PROGRAM } from "@/data/pullup-program";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Session Screen for "Unlock Your First Pull-up"
 *
 * Uses reusable guided-session components for consistent UI.
 */
export default function PullupProgramSessionScreen() {
  const router = useRouter();
  const {
    currentExercise,
    activeSession,
    hasActiveSession,
    isLoading,
    startSession,
    updateSessionValue,
    cancelSession,
    saveSetAndAdvance,
    removeCompletedSet,
    completeSession,
    currentSetIndex,
    totalSets,
    completedSets,
    isLastSet,
    inputValue: hookInputValue,
  } = usePullupProgram();

  const [inputText, setInputText] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ============================================
  // Rest Timer Setup (1 minute between sets)
  // ============================================
  const REST_DURATION_SECONDS = 60; // 1 minute rest
  const { timer, openModal: openTimerModal } = useGlobalRestTimer();
  const timerInitialized = useRef(false);

  // Initialize timer duration on mount
  useEffect(() => {
    if (!timerInitialized.current) {
      timer.setDuration(REST_DURATION_SECONDS);
      timerInitialized.current = true;
    }
  }, [timer]);

  // ============================================
  // Sync input text with hook state on resume
  // ============================================
  useEffect(() => {
    if (hookInputValue !== null && inputText === "") {
      setInputText(hookInputValue.toString());
    }
  }, [hookInputValue, inputText]);

  // ============================================
  // Start Session on Mount (if not already active)
  // Wait for loading to complete before deciding to start a new session
  // ============================================
  useEffect(() => {
    if (!isLoading && !hasActiveSession && currentExercise) {
      startSession();
    }
  }, [isLoading, hasActiveSession, currentExercise, startSession]);

  // ============================================
  // Handlers
  // ============================================

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      const parsed = parseInt(text, 10);
      updateSessionValue(isNaN(parsed) ? null : parsed);
    },
    [updateSessionValue],
  );

  const handleNextSet = useCallback(async () => {
    if (!inputText || hookInputValue === null) return;

    const success = await saveSetAndAdvance();
    if (success) {
      setInputText("");
      // Start rest timer after completing a set
      timer.reset();
      timer.start();
    }
  }, [inputText, hookInputValue, saveSetAndAdvance, timer]);

  const handleComplete = useCallback(async () => {
    if (!inputText || hookInputValue === null) return;

    // Stop timer when completing session
    timer.reset();

    const result = await completeSession();

    if (result?.programCompleted) {
      // Program finished - go to completion screen
      router.replace("/pullup-program/complete" as any);
    } else if (result?.advanced) {
      // Advanced to next exercise - reset input and start new session automatically
      setInputText("");
      // The session will auto-start via useEffect since hasActiveSession becomes false
      // and currentExercise changes to the next one
    } else {
      // Same exercise (shouldn't happen with sessionsRequired: 1)
      router.replace("/pullup-program" as any);
    }
  }, [inputText, hookInputValue, completeSession, router, timer]);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    timer.reset(); // Stop timer when cancelling
    cancelSession();
    router.replace("/pullup-program" as any);
  }, [cancelSession, router, timer]);

  // ============================================
  // Guards
  // ============================================

  if (!currentExercise) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-4">
        <Text className="font-secondary text-gray-500">
          No exercise available
        </Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !hasActiveSession || totalSets === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-4">
        <Text className="font-secondary text-gray-500">
          {isLoading ? "Loading session..." : "Starting session..."}
        </Text>
      </SafeAreaView>
    );
  }

  const inputType = currentExercise.targetType === "time" ? "time" : "reps";
  const canProceed = inputText.length > 0 && hookInputValue !== null;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
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
              programName={PULLUP_PROGRAM.name}
              exerciseName={currentExercise.name}
              currentSet={currentSetIndex + 1}
              totalSets={totalSets}
            />

            {/* Rest Timer (shows when active) */}
            <View className="mx-4">
              <InlineRestTimer timer={timer} onExpand={openTimerModal} />
            </View>

            {/* Media */}
            <ExerciseMedia media={currentExercise.media} />

            {/* Form Cues */}
            <FormCuesCard instructions={currentExercise.instructions} />

            {/* Spacer */}
            <View className="flex-1" />

            {/* Bottom Section */}
            <View className="px-4 pb-6">
              {/* Target */}
              <TargetGoalCard
                targetValue={currentExercise.targetValue}
                targetUnit={currentExercise.targetUnit}
              />

              {/* Input */}
              <SetInput
                value={inputText}
                onChangeText={handleInputChange}
                currentSet={currentSetIndex + 1}
                inputType={inputType}
              />

              {/* Completed Sets */}
              <CompletedSetsList
                completedSets={completedSets}
                inputType={inputType}
                onRemoveSet={removeCompletedSet}
              />

              {/* Actions */}
              <SessionActions
                isLastSet={isLastSet}
                canProceed={canProceed}
                onNextSet={handleNextSet}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Cancel Confirmation Modal */}
      <CancelWorkoutModal
        visible={showCancelModal}
        onKeepWorking={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}
