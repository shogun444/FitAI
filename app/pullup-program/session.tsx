import {
  CancelWorkoutModal,
  CompletedSetsList,
  ExerciseMedia,
  FormCuesCard,
  SessionActions,
  SessionHeader,
  SetInput,
  TargetGoalCard,
  TimeExerciseSession,
} from "@/components";
import { InlineRestTimer } from "@/components/programs";
import { useGlobalRestTimer } from "@/contexts/RestTimerContext";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
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
 * NEW MODEL (v2):
 * - Every session includes ALL exercises
 * - User completes sets for each exercise in order
 * - Session completes when all exercises are done
 */
export default function PullupProgramSessionScreen() {
  const router = useRouter();
  const {
    activeSession,
    hasActiveSession,
    isLoading,
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    currentSetIndex,
    totalSetsForExercise,
    currentSets,
    isLastSet,
    isLastSetOfSession,
    startSession,
    updateSessionValue,
    cancelSession,
    saveSetAndAdvance,
    removeCompletedSet,
    completeSession,
    inputValue: hookInputValue,
  } = usePullupProgram();

  const [inputText, setInputText] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ============================================
  // Rest Timer Setup (1 minute between sets)
  // ============================================
  const REST_DURATION_SECONDS = 60;
  const { timer, openModal: openTimerModal } = useGlobalRestTimer();
  const timerInitialized = useRef(false);

  useEffect(() => {
    // Only set duration if timer hasn't been initialized AND isn't currently running
    // This prevents resetting an active timer when navigating back to this screen
    if (!timerInitialized.current && !timer.isRunning && !timer.hasStarted) {
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
  // ============================================
  useEffect(() => {
    if (!isLoading && !hasActiveSession) {
      startSession();
    }
  }, [isLoading, hasActiveSession, startSession]);

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

    const result = await saveSetAndAdvance();

    if (result.sessionComplete) {
      // Don't advance - let user click "Complete Session"
      return;
    }

    setInputText("");
    timer.reset();
    timer.start();
  }, [inputText, hookInputValue, saveSetAndAdvance, timer]);

  const handleComplete = useCallback(async () => {
    if (!inputText || hookInputValue === null || !activeSession) return;

    timer.reset();

    // Save final set and complete
    const result = await completeSession();

    // Build exercise summary data for the summary page
    // Note: completeSession adds the final set, so we need to include it
    const currentExIdx = activeSession.currentExerciseIndex;
    const exerciseData = activeSession.exercises.map((ex, idx) => {
      const sets = [...ex.sets];
      // Add the final set that completeSession just saved
      if (idx === currentExIdx) {
        const isTimeExercise =
          PULLUP_PROGRAM_EXERCISES[idx]?.targetType === "time";
        sets.push({
          setIndex: activeSession.currentSetIndex,
          ...(isTimeExercise
            ? { timeCompleted: hookInputValue }
            : { repsCompleted: hookInputValue }),
        });
      }
      return {
        name: PULLUP_PROGRAM_EXERCISES[idx]?.name ?? `Exercise ${idx + 1}`,
        sets: sets.map((s) => ({
          reps: s.repsCompleted,
          time: s.timeCompleted,
        })),
      };
    });

    if (result?.programCompleted) {
      router.replace("/pullup-program/complete" as any);
    } else {
      router.replace({
        pathname: "/pullup-program/summary" as any,
        params: {
          sessionNumber: activeSession.sessionNumber.toString(),
          exerciseData: JSON.stringify(exerciseData),
        },
      });
    }
  }, [
    inputText,
    hookInputValue,
    activeSession,
    completeSession,
    router,
    timer,
  ]);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    timer.reset();
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

  if (isLoading || !hasActiveSession) {
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
  const isTimeBasedExercise = currentExercise.targetType === "time";

  // Build exercise progress indicator
  const exerciseProgress = `Exercise ${currentExerciseIndex + 1} of ${totalExercises}`;
  const sessionLabel = `Session ${activeSession?.sessionNumber ?? 1}`;

  // ============================================
  // TIME-BASED EXERCISE FLOW (e.g., Dead Hangs)
  // ============================================
  if (isTimeBasedExercise) {
    const handleTimeComplete = async (timeCompleted: number) => {
      // Save the time as the set value and advance
      const result = await saveSetAndAdvance(timeCompleted);

      if (result.sessionComplete && result.finalSession) {
        // Complete the session using the final session from saveSetAndAdvance
        timer.reset();
        const completeResult = await completeSession(true, result.finalSession);

        // Build exercise summary data for the summary page
        const exerciseData = result.finalSession.exercises.map((ex, idx) => ({
          name: PULLUP_PROGRAM_EXERCISES[idx]?.name ?? `Exercise ${idx + 1}`,
          sets: ex.sets.map((s) => ({
            reps: s.repsCompleted,
            time: s.timeCompleted,
          })),
        }));

        if (completeResult?.programCompleted) {
          router.replace("/pullup-program/complete" as any);
        } else {
          router.replace({
            pathname: "/pullup-program/summary" as any,
            params: {
              sessionNumber: result.finalSession.sessionNumber.toString(),
              exerciseData: JSON.stringify(exerciseData),
            },
          });
        }
        return;
      }

      // Start rest timer after completing a set
      timer.reset();
      timer.start();
    };

    return (
      <>
        <TimeExerciseSession
          programName={PULLUP_PROGRAM.name}
          exerciseName={currentExercise.name}
          formCues={currentExercise.instructions}
          defaultDuration={currentExercise.targetValue}
          allowedDurations={[5, 10, 15, 20, 25, 30]}
          currentSet={currentSetIndex + 1}
          totalSets={totalSetsForExercise}
          isLastSet={isLastSetOfSession}
          targetTime={currentExercise.targetValue}
          media={currentExercise.media}
          completedSets={currentSets}
          onComplete={handleTimeComplete}
          onCancel={handleCancel}
        />
        <CancelWorkoutModal
          visible={showCancelModal}
          onKeepWorking={() => setShowCancelModal(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      </>
    );
  }

  // ============================================
  // REPS-BASED EXERCISE FLOW (default)
  // ============================================

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
            {/* Header with session and exercise progress */}
            <View className="px-4 pt-4 pb-2">
              <Text className="font-secondary text-primary text-sm">
                {sessionLabel} • {exerciseProgress}
              </Text>
            </View>

            <SessionHeader
              programName={PULLUP_PROGRAM.name}
              exerciseName={currentExercise.name}
              currentSet={currentSetIndex + 1}
              totalSets={totalSetsForExercise}
            />

            {/* Rest Timer */}
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

              {/* Completed Sets for current exercise */}
              <CompletedSetsList
                completedSets={currentSets}
                inputType={inputType}
                onRemoveSet={removeCompletedSet}
              />

              {/* Actions */}
              <SessionActions
                isLastSet={isLastSetOfSession}
                canProceed={canProceed}
                onNextSet={handleNextSet}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CancelWorkoutModal
        visible={showCancelModal}
        onKeepWorking={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}
