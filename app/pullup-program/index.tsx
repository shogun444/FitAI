import { Button, Card, Heading, Subheading } from "@/components";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
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
        <ScrollView className="flex-1 p-4">
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6">
              <Ionicons name="trophy" size={48} color="#000" />
            </View>
            <Heading className="text-center mb-2">Program Complete!</Heading>
            <Subheading className="text-center mb-2">
              You've completed all {targetSessions} sessions!
            </Subheading>
            <Text className="font-secondary text-gray-500 text-center">
              "Unlock Your First Pull-up"
            </Text>
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
    const sessionsRemaining = getSessionsRemaining();
    const nextSessionNumber = getNextSessionNumber();
    const lastSession = getLastSessionData();
    const exercisesInSession = getAllExercises();

    const handleContinue = () => {
      router.push("/pullup-program/session" as any);
    };

    // Calculate active session progress
    let activeSessionProgress = null;
    if (hasActiveSession && activeSession) {
      const currentExIdx = activeSession.currentExerciseIndex;
      const currentSetIdx = activeSession.currentSetIndex;
      const currentExercise = PULLUP_PROGRAM_EXERCISES[currentExIdx];
      activeSessionProgress = {
        exerciseName: currentExercise?.name ?? "Unknown",
        exerciseNumber: currentExIdx + 1,
        totalExercises: PULLUP_PROGRAM_EXERCISES.length,
        currentSet: currentSetIdx + 1,
        totalSets: currentExercise?.setsPerSession ?? 0,
      };
    }

    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView className="flex-1 p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="font-secondary text-primary text-sm mb-1">
              {PULLUP_PROGRAM.name}
            </Text>
            <Heading className="mb-2">
              Session{" "}
              {hasActiveSession
                ? activeSession?.sessionNumber
                : nextSessionNumber}{" "}
              of {targetSessions}
            </Heading>
            <Subheading>
              {sessionsRemaining} session{sessionsRemaining !== 1 ? "s" : ""}{" "}
              remaining
            </Subheading>
          </View>

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${(completedSessionsCount / targetSessions) * 100}%`,
                }}
              />
            </View>
            <Text className="font-secondary text-sm text-gray-500 mt-2 text-center">
              {completedSessionsCount} of {targetSessions} sessions completed
            </Text>
          </View>

          {/* Active Session Card (if in progress) */}
          {hasActiveSession && activeSessionProgress && (
            <Card className="mb-4 border-2 border-primary">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                  <Ionicons name="play" size={20} color="#000" />
                </View>
                <View className="flex-1">
                  <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
                    Session In Progress
                  </Text>
                  <Text className="font-secondary text-sm text-gray-500">
                    Resume where you left off
                  </Text>
                </View>
              </View>

              <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300">
                  {activeSessionProgress.exerciseName}
                </Text>
                <Text className="font-secondary text-sm text-gray-500 mt-1">
                  Exercise {activeSessionProgress.exerciseNumber} of{" "}
                  {activeSessionProgress.totalExercises} • Set{" "}
                  {activeSessionProgress.currentSet} of{" "}
                  {activeSessionProgress.totalSets}
                </Text>
              </View>

              <Button title="Continue Session" onPress={handleContinue} />
            </Card>
          )}

          {/* Start New Session Card (if no active session) */}
          {!hasActiveSession && (
            <Card className="mb-4 border-2 border-primary">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                  <Text className="font-primaryBold text-black">
                    {nextSessionNumber}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
                    Ready for Session {nextSessionNumber}
                  </Text>
                  <Text className="font-secondary text-sm text-gray-500">
                    Complete all 3 exercises
                  </Text>
                </View>
              </View>

              <Button title="Start Session" onPress={handleContinue} />
            </Card>
          )}

          {/* Session Exercises Overview */}
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Exercises Per Session
          </Text>

          {exercisesInSession.map(
            (
              {
                exercise,
                setsCompleted,
                totalSets,
                isCurrentExercise,
                isComplete,
              },
              index,
            ) => {
              const unit = exercise.targetType === "time" ? "sec" : "reps";

              return (
                <Card key={exercise.id} className="mb-2">
                  <View className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isComplete
                          ? "bg-green-500"
                          : isCurrentExercise
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {isComplete ? (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      ) : (
                        <Text
                          className={`font-secondarySemiBold text-sm ${
                            isCurrentExercise ? "text-black" : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-primaryMedium text-gray-900 dark:text-white">
                        {exercise.name}
                      </Text>
                      <Text className="font-secondary text-sm text-gray-500">
                        {totalSets} sets × {exercise.targetValue} {unit}
                        {hasActiveSession && setsCompleted > 0 && (
                          <Text className="text-primary">
                            {" "}
                            • {setsCompleted}/{totalSets} done
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            },
          )}

          {/* Last Session Summary (if available) */}
          {lastSession && (
            <View className="mt-4">
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
                Last Session (#{lastSession.sessionNumber})
              </Text>
              {lastSession.exercises.map((exData) => {
                const exercise = PULLUP_PROGRAM_EXERCISES.find(
                  (e) => e.id === exData.exerciseId,
                );
                if (!exercise) return null;
                const unit = exercise.targetType === "time" ? "sec" : "reps";

                return (
                  <Card
                    key={exData.exerciseId}
                    className="mb-2 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <Text className="font-primaryMedium text-gray-700 dark:text-gray-300 mb-1">
                      {exercise.name}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {exData.sets.map((set, idx) => {
                        const value =
                          set.repsCompleted ?? set.timeCompleted ?? 0;
                        return (
                          <View
                            key={idx}
                            className="bg-green-500/10 px-2 py-1 rounded"
                          >
                            <Text className="font-secondary text-xs text-green-600 dark:text-green-400">
                              {value} {unit}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
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
      <ScrollView className="flex-1 p-4">
        {/* Hero Section */}
        <View className="items-center py-8">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="fitness" size={40} color="#c9f158" />
          </View>
          <Heading className="text-center mb-2">{PULLUP_PROGRAM.name}</Heading>
          <Subheading className="text-center">
            Your guided path to your first pull-up
          </Subheading>
        </View>

        {/* Description Card */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
            About This Program
          </Text>
          <Text className="font-secondary text-gray-600 dark:text-gray-400 leading-6">
            {PULLUP_PROGRAM.description}
          </Text>
        </Card>

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
