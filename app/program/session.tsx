import {
  InlineRestTimer,
  ProgramSetRow,
  ProgressDelta,
} from "@/components/programs";
import {
  AutoAdvanceNumberInputRef,
  Button,
  Card,
  Heading,
  Subheading,
} from "@/components/ui";
import { useGlobalRestTimer } from "@/contexts/RestTimerContext";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { classifyPerformance } from "@/lib/programRules";
import {
  LiftPerformance,
  PrescribedLift,
  PROGRAM_LIFTS,
  ProgramLiftId,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { createRef, memo, useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// Constants (moved outside component to prevent recreation)
// ============================================

const TIER_COLORS = {
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-red-500",
} as const;

const TIER_LABELS = {
  A: "Excellent",
  B: "Solid",
  C: "Partial",
  D: "Building",
} as const;

// ============================================
// Types
// ============================================

interface LiftProgress {
  liftIndex: number;
  setIndex: number;
}

// ============================================
// Lift Card Component (Memoized)
// ============================================

interface LiftCardProps {
  lift: PrescribedLift;
  repsPerSet: (number | null)[];
  currentSetIndex: number;
  isCurrentLift: boolean;
  onRepsChange: (setIndex: number, reps: number) => void;
  /** Previous session weight for progress display (null if first session) */
  previousWeight: number | null;
  /** Last session performance data for context (null if first session) */
  lastPerformance: LiftPerformance | null;
  /** Ref to the first input of the next lift card (for cross-lift auto-advance) */
  nextLiftFirstInputRef?: React.RefObject<AutoAdvanceNumberInputRef>;
}

const LiftCard = memo(function LiftCard({
  lift,
  repsPerSet,
  currentSetIndex,
  isCurrentLift,
  onRepsChange,
  previousWeight,
  lastPerformance,
  nextLiftFirstInputRef,
}: LiftCardProps) {
  // Create refs for each set input within this lift
  // Using useMemo to ensure refs persist across re-renders
  const setRefs = useMemo(
    () =>
      Array.from({ length: lift.sets }, () =>
        createRef<AutoAdvanceNumberInputRef>(),
      ),
    [lift.sets],
  );

  const liftInfo = PROGRAM_LIFTS.find((l) => l.id === lift.liftId)!;
  const completedSets = repsPerSet.filter(
    (r) => r !== null && r >= lift.reps,
  ).length;
  const tier = classifyPerformance(completedSets, false);

  // Check if all sets for this lift are completed
  const allSetsCompleted = repsPerSet.every((r) => r !== null && r > 0);

  return (
    <Card
      className={`mb-4 ${isCurrentLift ? "border-2 border-primary-500" : ""}`}
    >
      {/* Lift header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            {liftInfo.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mr-2">
              <Text className="font-primaryBold text-primary-600 text-sm">
                {lift.weight} kg
              </Text>
            </View>
            <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm">
              {lift.sets} × {lift.reps} reps
            </Text>
          </View>
        </View>

        {/* Tier badge */}
        {allSetsCompleted && (
          <View className={`px-3 py-1.5 rounded-full ${TIER_COLORS[tier]}`}>
            <Text className="font-secondaryMedium text-white text-xs">
              {TIER_LABELS[tier]}
            </Text>
          </View>
        )}
      </View>

      {/* Progress since last session */}
      <ProgressDelta
        previousWeight={previousWeight}
        currentWeight={lift.weight}
        variant="inline"
        className="mb-3"
      />

      {/* Sets with auto-advance refs */}
      <View className="gap-2">
        {Array.from({ length: lift.sets }).map((_, setIndex) => {
          const isActive = isCurrentLift && setIndex === currentSetIndex;
          const reps = repsPerSet[setIndex];
          const isLastSetInLift = setIndex === lift.sets - 1;

          // Get previous session data for this specific set
          const previousReps = lastPerformance?.repsPerSet[setIndex] ?? null;
          const prevWeight = lastPerformance?.weight ?? null;

          // Determine next input ref:
          // - If not last set in lift: next set in same lift
          // - If last set in lift: first set of next lift (if exists)
          // - If last set of last lift: isLast=true (dismisses keyboard)
          const nextRef = isLastSetInLift
            ? nextLiftFirstInputRef
            : setRefs[setIndex + 1];
          const isLastSet = isLastSetInLift && !nextLiftFirstInputRef;

          return (
            <ProgramSetRow
              key={`set-${setIndex}`}
              ref={setRefs[setIndex]}
              setNumber={setIndex + 1}
              prescribedReps={lift.reps}
              repsCompleted={reps}
              isActive={isActive}
              onRepsChange={(newReps) => onRepsChange(setIndex, newReps)}
              previousReps={previousReps}
              previousWeight={prevWeight}
              nextInputRef={nextRef}
              isLastSet={isLastSet}
            />
          );
        })}
      </View>

      {/* Progress summary */}
      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm">
          Sets at target ({lift.reps}+ reps)
        </Text>
        <Text className="font-primarySemiBold text-gray-900 dark:text-white text-sm">
          {completedSets} / {lift.sets}
        </Text>
      </View>
    </Card>
  );
});

// ============================================
// Main Session Screen
// ============================================

export default function ProgramSessionScreen() {
  const { program, getTodaySession, recordSession, loading } =
    useProgramInstance();

  // Global rest timer (shared across all screens)
  const { timer, openModal: openRestTimer } = useGlobalRestTimer();

  // Check if timer is active (running or paused with time remaining)
  const isTimerActive = timer.hasStarted && timer.remaining > 0;

  // Start rest timer with default duration
  const handleStartRest = () => {
    timer.reset();
    timer.start();
  };

  // Session progress state
  const [currentProgress, setCurrentProgress] = useState<LiftProgress>({
    liftIndex: 0,
    setIndex: 0,
  });

  // Reps tracking: liftId -> array of reps per set (null = not logged)
  const [repsPerLift, setRepsPerLift] = useState<
    Record<ProgramLiftId, (number | null)[]>
  >({
    "weighted-pullups": [null, null, null, null, null],
    "weighted-dips": [null, null, null, null, null],
    squats: [null, null, null, null, null],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = getTodaySession();

  // Compute total progress
  const totalProgress = useMemo(() => {
    if (!session) return { completed: 0, total: 0 };

    let completed = 0;
    let total = 0;

    for (const lift of session.lifts) {
      const liftReps = repsPerLift[lift.liftId];
      total += lift.sets;
      completed += liftReps.filter((r) => r !== null && r > 0).length;
    }

    return { completed, total };
  }, [session, repsPerLift]);

  // Check if all sets are completed
  const allSetsCompleted = useMemo(() => {
    if (!session) return false;
    return session.lifts.every((lift) =>
      repsPerLift[lift.liftId].every((r) => r !== null && r > 0),
    );
  }, [session, repsPerLift]);

  // Handle reps change for a set
  // State is ALWAYS reversible - clearing reps sets to null, re-entering sets value
  // No locking, no one-way transitions
  const handleRepsChange = useCallback(
    (liftId: ProgramLiftId, setIndex: number, reps: number) => {
      setRepsPerLift((prev) => {
        const newReps = [...prev[liftId]];
        // Derive completion from value: reps > 0 = completed, reps = 0 = not completed
        newReps[setIndex] = reps > 0 ? reps : null;
        return { ...prev, [liftId]: newReps };
      });

      // Auto-advance current progress indicator (but do NOT lock previous inputs)
      // This only moves the "active" highlight, not editability
      if (reps > 0 && session) {
        const currentLiftIndex = session.lifts.findIndex(
          (l) => l.liftId === liftId,
        );
        const isLastSetOfLift =
          setIndex === session.lifts[currentLiftIndex].sets - 1;
        const isLastLift = currentLiftIndex === session.lifts.length - 1;

        // Move active indicator to next set (purely visual)
        if (!isLastSetOfLift) {
          setCurrentProgress({
            liftIndex: currentLiftIndex,
            setIndex: setIndex + 1,
          });
        } else if (!isLastLift) {
          setCurrentProgress({
            liftIndex: currentLiftIndex + 1,
            setIndex: 0,
          });
        }
      }
    },
    [session],
  );

  // Handle session finish
  const handleFinishSession = useCallback(async () => {
    if (!session || !program) return;
    setIsSubmitting(true);

    const sessionNumber = program.sessionIndex;

    // Convert null to 0 for submission
    const inputs = session.lifts.map((lift) => ({
      liftId: lift.liftId,
      repsPerSet: repsPerLift[lift.liftId].map((r) => r ?? 0),
      feltEasy: false,
    }));

    const result = await recordSession(inputs);
    setIsSubmitting(false);

    if (result?.liftPerformances) {
      router.replace({
        pathname: "/program/summary",
        params: {
          sessionNumber: String(sessionNumber),
          performances: JSON.stringify(result.liftPerformances),
        },
      });
    } else {
      router.replace("/(tabs)");
    }
  }, [session, program, repsPerLift, recordSession]);

  // Loading state
  if (loading || !program || !session) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="font-secondary text-gray-500 dark:text-gray-400">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const currentWeek = Math.ceil(program.sessionIndex / 2);
  const progressPercent = (totalProgress.completed / totalProgress.total) * 100;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="font-primaryBold text-lg text-gray-900 dark:text-white">
            Session {program.sessionIndex}
          </Text>
          <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
            Week {currentWeek} • {totalProgress.completed}/{totalProgress.total}{" "}
            sets
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-gray-200 dark:bg-gray-800">
        <View
          className="h-full bg-primary-500"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Fixed Rest Timer - stays visible when scrolling */}
      <View className="z-10 px-4 pt-4">
        {isTimerActive ? (
          <InlineRestTimer timer={timer} onExpand={openRestTimer} />
        ) : (
          <TouchableOpacity
            onPress={handleStartRest}
            className="flex-row items-center justify-center bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-3 mb-2"
          >
            <Ionicons name="timer-outline" size={20} color="#7c3aed" />
            <Text className="font-secondaryMedium text-primary-600 dark:text-primary-400 text-base ml-2">
              Start Rest Timer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Heading className="mb-1">Today's Workout</Heading>
        <Subheading className="mb-4">
          Enter reps for each set. Tap Rest when ready.
        </Subheading>

        {/* Lift cards with cross-lift auto-advance refs */}
        {session.lifts.map((lift, liftIndex) => {
          // For cross-lift auto-advance, we need to pass the next lift's first input ref
          // This is handled internally by LiftCard - we just need to chain them
          const isLastLift = liftIndex === session.lifts.length - 1;

          // Get previous session data for progress display
          const liftState = program.lifts.find((l) => l.liftId === lift.liftId);
          const previousWeight = liftState?.lastPerformance?.weight ?? null;
          const lastPerformance = liftState?.lastPerformance ?? null;

          return (
            <LiftCard
              key={lift.liftId}
              lift={lift}
              repsPerSet={repsPerLift[lift.liftId]}
              currentSetIndex={
                liftIndex === currentProgress.liftIndex
                  ? currentProgress.setIndex
                  : -1
              }
              isCurrentLift={liftIndex === currentProgress.liftIndex}
              onRepsChange={(setIndex, reps) =>
                handleRepsChange(lift.liftId, setIndex, reps)
              }
              previousWeight={previousWeight}
              lastPerformance={lastPerformance}
              // Last lift has no next lift to advance to
              nextLiftFirstInputRef={isLastLift ? undefined : undefined}
            />
          );
        })}

        {/* Tier explanation */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-4">
          <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-2">
            Progression Rules
          </Text>
          <View className="gap-1">
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              5 sets at target → +5 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              4 sets at target → +2 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              3 sets at target → +1 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              0-2 sets at target → Same weight next session
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          title={isSubmitting ? "Saving..." : "Finish Session"}
          onPress={handleFinishSession}
          disabled={!allSetsCompleted || isSubmitting}
          className={!allSetsCompleted ? "opacity-50" : ""}
        />
        {!allSetsCompleted && (
          <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs text-center mt-2">
            Complete all sets to finish session
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
