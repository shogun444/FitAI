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
import { PULLUP_PROGRAM } from "@/data/pullup-program";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  } = usePullupProgram();

  const [inputValue, setInputValue] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ============================================
  // Start Session on Mount (if not already active)
  // ============================================
  useEffect(() => {
    if (!hasActiveSession && currentExercise) {
      startSession();
    }
  }, [hasActiveSession, currentExercise, startSession]);

  // ============================================
  // Handlers
  // ============================================

  const handleInputChange = useCallback(
    (text: string) => {
      setInputValue(text);
      const parsed = parseInt(text, 10);
      updateSessionValue(isNaN(parsed) ? null : parsed);
    },
    [updateSessionValue],
  );

  const handleNextSet = useCallback(() => {
    if (!inputValue || !activeSession?.value) return;

    const success = saveSetAndAdvance();
    if (success) {
      setInputValue("");
    }
  }, [inputValue, activeSession, saveSetAndAdvance]);

  const handleComplete = useCallback(async () => {
    if (!inputValue || !activeSession?.value) return;

    const result = await completeSession();

    if (result?.programCompleted) {
      // Program finished - go to completion screen
      router.replace("/pullup-program/complete" as any);
    } else if (result?.advanced) {
      // Advanced to next exercise - reset input and start new session automatically
      setInputValue("");
      // The session will auto-start via useEffect since hasActiveSession becomes false
      // and currentExercise changes to the next one
    } else {
      // Same exercise (shouldn't happen with sessionsRequired: 1)
      router.replace("/pullup-program" as any);
    }
  }, [inputValue, activeSession, completeSession, router]);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    cancelSession();
    router.replace("/pullup-program" as any);
  }, [cancelSession, router]);

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

  if (!hasActiveSession || totalSets === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-4">
        <Text className="font-secondary text-gray-500">
          Starting session...
        </Text>
      </SafeAreaView>
    );
  }

  const inputType = currentExercise.targetType === "time" ? "time" : "reps";
  const canProceed = inputValue.length > 0 && activeSession?.value !== null;

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
                value={inputValue}
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
