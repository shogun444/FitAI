import { Button, Card, Heading, ScreenHeader, Subheading } from "@/components";
import { ProgramAdviceSection, ProgramHeader } from "@/components/programs";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
  PULLUP_PROGRAM_INFO,
} from "@/data/pullup-program";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Program Overview Screen
 *
 * NEW MODEL (v2):
 * - Shows program-level progress (Session X of Y)
 * - Every session includes ALL exercises
 * - No per-exercise progression
 */
export default function PullupProgramOverviewScreen() {
  const router = useRouter();
  const {
    isLoading,
    hasStarted,
    isCompleted,
    hasActiveSession,
    activeSession,
    targetSessions,
    completedSessionsCount,
    startProgram,
    startSession,
    getSessionsRemaining,
    getNextSessionNumber,
    getAllExercises,
    getLastSessionData,
    resetProgram,
    refresh,
  } = usePullupProgram();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#c9f158" />
      </SafeAreaView>
    );
  }

  // ============================================
  // Program Completed View
  // ============================================
  if (isCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Header - unified ScreenHeader component */}
        <ScreenHeader title={PULLUP_PROGRAM.name} />

        <ScrollView className="flex-1 p-4">
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6">
              <Ionicons name="trophy" size={48} color="#000" />
            </View>
            <Heading className="text-center mb-2">Program Complete!</Heading>
            <Subheading className="text-center mb-2">
              You've completed all {targetSessions} sessions!
            </Subheading>
          </View>

          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              What's Next?
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-4">
              You've built the foundation through {targetSessions} sessions of
              consistent training. Now it's time to attempt your first pull-up!
              If you're not quite there yet, you can restart the program to
              continue building strength.
            </Text>
            <Button
              title="Restart Program"
              variant="secondary"
              onPress={async () => {
                await resetProgram();
              }}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // Program In Progress View
  // ============================================
  if (hasStarted) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Header - unified ScreenHeader component */}
        <ScreenHeader title={PULLUP_PROGRAM.name} />

        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
          {/* Program Header - same intro card as Weighted Calisthenics Strength */}
          <ProgramHeader program={PULLUP_PROGRAM_INFO} />

          {/* Recovery Guidelines */}
          <ProgramAdviceSection advice={PULLUP_PROGRAM_INFO.advice} />

          {/* Enrolled State */}
          <View className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="font-secondary text-center text-gray-600 dark:text-gray-400">
              You already have an active program. Complete it first.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // Program Not Started View
  // ============================================
  const handleStartProgram = async () => {
    await startProgram();
    router.push("/pullup-program/session" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header - unified ScreenHeader component */}
      <ScreenHeader title={PULLUP_PROGRAM.name} />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
        {/* Program Header - same intro card as Weighted Calisthenics Strength */}
        <ProgramHeader program={PULLUP_PROGRAM_INFO} />

        {/* Recovery Guidelines */}
        <ProgramAdviceSection advice={PULLUP_PROGRAM_INFO.advice} />

        {/* Program Structure */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Every Session Includes
          </Text>

          <View className="gap-3">
            {PULLUP_PROGRAM_EXERCISES.map((exercise, index) => {
              const unit = exercise.targetType === "time" ? "seconds" : "reps";
              return (
                <View key={exercise.id} className="flex-row items-start">
                  <View className="w-6 h-6 bg-primary/20 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="font-secondarySemiBold text-primary text-xs">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-primaryMedium text-gray-900 dark:text-white">
                      {exercise.name}
                    </Text>
                    <Text className="font-secondary text-sm text-gray-500">
                      {exercise.setsPerSession} sets × {exercise.targetValue}{" "}
                      {unit}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Ready Card */}
        <Card className="mb-6 bg-primary/10 dark:bg-primary/20 border border-primary">
          <View className="items-center py-2">
            <Ionicons name="checkmark-circle" size={32} color="#c9f158" />
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mt-2">
              {PULLUP_PROGRAM.targetSessions} Sessions to Success
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-center mt-1">
              Complete all exercises each session. Build strength through
              consistency.
            </Text>
          </View>
        </Card>

        {/* Start Button */}
        <Button title="Start Program" onPress={handleStartProgram} />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
