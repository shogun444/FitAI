import { Button, Card, Heading, Subheading } from "@/components/ui";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { classifyPerformance } from "@/lib/programRules";
import { PrescribedLift, PROGRAM_LIFTS, ProgramLiftId } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SetTrackerProps {
  liftId: ProgramLiftId;
  lift: PrescribedLift;
  repsPerSet: number[];
  onRepsChange: (liftId: ProgramLiftId, setIndex: number, reps: number) => void;
}

function SetTracker({
  liftId,
  lift,
  repsPerSet,
  onRepsChange,
}: SetTrackerProps) {
  const liftInfo = PROGRAM_LIFTS.find((l) => l.id === liftId)!;
  const setsCompleted = repsPerSet.filter((r) => r >= 5).length;
  const tier = classifyPerformance(setsCompleted, false);

  const tierColors = {
    A: "bg-green-500",
    B: "bg-blue-500",
    C: "bg-yellow-500",
    D: "bg-red-500",
  };

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            {liftInfo.name}
          </Text>
          <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
            {lift.weight} kg × {lift.reps} reps × {lift.sets} sets
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${tierColors[tier]}`}>
          <Text className="font-primaryBold text-white text-sm">
            Tier {tier}
          </Text>
        </View>
      </View>

      {/* Set circles - tap to toggle complete/incomplete */}
      <View className="flex-row gap-2 mb-3">
        {Array.from({ length: lift.sets }).map((_, index) => {
          const isCompleted = repsPerSet[index] >= 5;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onRepsChange(liftId, index, isCompleted ? 0 : 5)}
              className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                isCompleted
                  ? "bg-primary-500 border-primary-500"
                  : "bg-transparent border-gray-300 dark:border-gray-600"
              }`}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={24} color="white" />
              ) : (
                <Text className="font-primaryBold text-gray-400 dark:text-gray-500">
                  {index + 1}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick actions */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => {
            for (let i = 0; i < lift.sets; i++) {
              onRepsChange(liftId, i, 0);
            }
          }}
          className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <Text className="font-secondary text-center text-gray-600 dark:text-gray-400 text-sm">
            Reset
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            for (let i = 0; i < lift.sets; i++) {
              onRepsChange(liftId, i, 5);
            }
          }}
          className="flex-1 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
        >
          <Text className="font-secondary text-center text-primary-600 text-sm">
            All Done
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function ProgramSessionScreen() {
  const { program, getTodaySession, recordSession, loading } =
    useProgramInstance();

  // Track reps for each set of each lift
  const [repsPerLift, setRepsPerLift] = useState<
    Record<ProgramLiftId, number[]>
  >({
    "weighted-pullups": [0, 0, 0, 0, 0],
    "weighted-dips": [0, 0, 0, 0, 0],
    squats: [0, 0, 0, 0, 0],
  });

  const [feltEasy, setFeltEasy] = useState<Record<ProgramLiftId, boolean>>({
    "weighted-pullups": false,
    "weighted-dips": false,
    squats: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = getTodaySession();

  const handleRepsChange = useCallback(
    (liftId: ProgramLiftId, setIndex: number, reps: number) => {
      setRepsPerLift((prev) => {
        const newReps = [...prev[liftId]];
        newReps[setIndex] = reps;
        return {
          ...prev,
          [liftId]: newReps,
        };
      });
    },
    [],
  );

  const handleFinishSession = useCallback(async () => {
    if (!session || !program) return;
    setIsSubmitting(true);

    const sessionNumber = program.sessionIndex;
    const inputs = session.lifts.map((lift) => ({
      liftId: lift.liftId,
      repsPerSet: repsPerLift[lift.liftId],
      feltEasy: feltEasy[lift.liftId],
    }));

    const result = await recordSession(inputs);
    setIsSubmitting(false);

    // Navigate to summary with performance data
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
  }, [session, program, repsPerLift, feltEasy, recordSession]);

  if (loading || !program || !session) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="font-secondary text-gray-500 dark:text-gray-400">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const totalSets = session.lifts.length * 5;
  const totalCompleted = Object.values(repsPerLift)
    .flat()
    .filter((r) => r >= 5).length;
  const progress = (totalCompleted / totalSets) * 100;
  const allLiftsStarted = totalCompleted > 0;

  // Calculate week from session index (2 sessions per week)
  const currentWeek = Math.ceil(program.sessionIndex / 2);

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
            Week {currentWeek} • {totalCompleted}/{totalSets} sets
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-gray-200 dark:bg-gray-800">
        <View
          className="h-full bg-primary-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Heading className="mb-1">Today's Workout</Heading>
        <Subheading className="mb-6">
          Tap circles to mark sets complete. Your tier affects next session's
          weight.
        </Subheading>

        {session.lifts.map((lift) => (
          <SetTracker
            key={lift.liftId}
            liftId={lift.liftId}
            lift={lift}
            repsPerSet={repsPerLift[lift.liftId]}
            onRepsChange={handleRepsChange}
          />
        ))}

        {/* Tier explanation */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-2">
            Progression Tiers
          </Text>
          <View className="gap-1">
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              🟢 Tier A (5 sets): +5 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              🔵 Tier B (4 sets): +2 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              🟡 Tier C (3 sets): +1 kg next session
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-xs">
              🔴 Tier D (0-2 sets): Same weight next session
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          title={isSubmitting ? "Saving..." : "Finish Session"}
          onPress={handleFinishSession}
          disabled={!allLiftsStarted || isSubmitting}
          className={!allLiftsStarted ? "opacity-50" : ""}
        />
      </View>
    </SafeAreaView>
  );
}
