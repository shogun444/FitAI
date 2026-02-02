import { Button, Card, Heading, Subheading } from "@/components";
import { PULLUP_PROGRAM } from "@/data/pullup-program";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Program Overview Screen
 *
 * Shows:
 * - Program introduction (if not started)
 * - Current progress (if in progress)
 * - Completion celebration (if finished)
 */
export default function PullupProgramOverviewScreen() {
  const router = useRouter();
  const {
    isLoading,
    hasStarted,
    isCompleted,
    hasActiveSession,
    currentExercise,
    startProgram,
    startSession,
    getSessionsCompleted,
    getSessionsRemaining,
    getAllExerciseProgress,
    getCurrentExerciseProgress,
    resetProgram,
    refresh,
    currentSetIndex,
    totalSets,
    completedSets,
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
            <Subheading className="text-center mb-8">
              You've completed "Unlock Your First Pull-up"
            </Subheading>
          </View>

          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              What's Next?
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-4">
              You've built the foundation. Now it's time to attempt your first
              pull-up! If you're not quite there yet, you can restart the
              program to continue building strength.
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
  if (hasStarted && currentExercise) {
    const sessionsCompleted = getSessionsCompleted();
    const sessionsRemaining = getSessionsRemaining();
    const exerciseProgress = getAllExerciseProgress();

    const handleContinue = () => {
      router.push("/pullup-program/session" as any);
    };

    // Check if there's an in-progress session
    const hasInProgressSession = hasActiveSession && totalSets > 0;
    const sessionProgress = hasInProgressSession
      ? `Set ${currentSetIndex + 1} of ${totalSets}${completedSets.length > 0 ? ` (${completedSets.length} completed)` : ""}`
      : null;

    // Get last completed workout for this exercise
    const exerciseProgressData = getCurrentExerciseProgress();
    const lastSession =
      exerciseProgressData?.sessionHistory?.[
        exerciseProgressData.sessionHistory.length - 1
      ];

    // Determine which sets to display:
    // 1. If there's an active session with completed sets, show those
    // 2. Otherwise, if there's a last session, show those sets
    const displaySets = hasInProgressSession
      ? completedSets
      : (lastSession?.sets ?? []);

    const inputType = currentExercise.targetType === "time" ? "time" : "reps";
    const unit = inputType === "time" ? "sec" : "reps";

    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView className="flex-1 p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="font-secondary text-primary text-sm mb-1">
              {PULLUP_PROGRAM.name}
            </Text>
            <Heading className="mb-2">Continue Training</Heading>
            <Subheading>
              {sessionsRemaining} session
              {sessionsRemaining !== 1 ? "s" : ""} remaining for this exercise
            </Subheading>
          </View>

          {/* Current Exercise Card */}
          <Card className="mb-4 border-2 border-primary">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                <Text className="font-primaryBold text-black">
                  {sessionsCompleted}/{currentExercise.sessionsRequired}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
                  {currentExercise.name}
                </Text>
                <Text className="font-secondary text-sm text-gray-500">
                  Current exercise
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
              <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300">
                Goal: {currentExercise.targetValue} {currentExercise.targetUnit}
              </Text>
              {sessionProgress && (
                <Text className="font-secondaryMedium text-primary mt-1">
                  In Progress: {sessionProgress}
                </Text>
              )}
            </View>

            {/* Display sets from active session or last workout */}
            {displaySets.length > 0 && (
              <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 mb-2">
                  {hasInProgressSession ? "Completed Sets" : "Last Workout"}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {displaySets.map((set, idx) => {
                    const value = set.repsCompleted ?? set.timeCompleted ?? 0;
                    return (
                      <View
                        key={idx}
                        className="bg-green-500/20 px-3 py-1.5 rounded-full"
                      >
                        <Text className="font-secondaryMedium text-green-600 dark:text-green-400 text-sm">
                          Set {set.setIndex + 1}: {value} {unit}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <Button
              title={
                hasInProgressSession ? "Continue Session" : "Start Session"
              }
              onPress={handleContinue}
            />
          </Card>

          {/* Progress Overview */}
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Your Progress
          </Text>

          {exerciseProgress.map(
            ({
              exercise,
              completedSessions,
              isUnlocked,
              isComplete,
              sessionHistory,
            }) => {
              // Get the last session for this exercise (if any)
              const lastSession = sessionHistory?.[sessionHistory.length - 1];
              const lastSets = lastSession?.sets ?? [];
              const exerciseUnit =
                exercise.targetType === "time" ? "sec" : "reps";

              return (
                <Card key={exercise.id} className="mb-2">
                  <View className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isComplete
                          ? "bg-green-500"
                          : isUnlocked
                            ? "bg-primary"
                            : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      {isComplete ? (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      ) : (
                        <Text
                          className={`font-secondarySemiBold text-sm ${
                            isUnlocked ? "text-black" : "text-gray-500"
                          }`}
                        >
                          {completedSessions}/{exercise.sessionsRequired}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-primaryMedium ${
                          isUnlocked || isComplete
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {exercise.name}
                      </Text>
                      {!isUnlocked && !isComplete && (
                        <Text className="font-secondary text-xs text-gray-400">
                          Locked
                        </Text>
                      )}
                      {/* Show last workout sets if available */}
                      {lastSets.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-1">
                          {lastSets.map((set, idx) => {
                            const value =
                              set.repsCompleted ?? set.timeCompleted ?? 0;
                            return (
                              <Text
                                key={idx}
                                className="font-secondary text-xs text-gray-500"
                              >
                                {idx > 0 ? " • " : ""}
                                {value}
                                {exerciseUnit}
                              </Text>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              );
            },
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
    startSession();
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
            What You'll Do
          </Text>

          <View className="gap-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-primary/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="font-secondarySemiBold text-primary text-xs">
                  1
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-primaryMedium text-gray-900 dark:text-white">
                  Negative Pull-ups
                </Text>
                <Text className="font-secondary text-sm text-gray-500">
                  Build lowering strength • 5 sessions
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-primary/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="font-secondarySemiBold text-primary text-xs">
                  2
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-primaryMedium text-gray-900 dark:text-white">
                  Inverted Rows
                </Text>
                <Text className="font-secondary text-sm text-gray-500">
                  Build pulling strength • 5 sessions
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-primary/20 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="font-secondarySemiBold text-primary text-xs">
                  3
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-primaryMedium text-gray-900 dark:text-white">
                  Dead Hangs
                </Text>
                <Text className="font-secondary text-sm text-gray-500">
                  Build grip strength • 5 sessions
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Ready Card */}
        <Card className="mb-6 bg-primary/10 dark:bg-primary/20 border border-primary">
          <View className="items-center py-2">
            <Ionicons name="checkmark-circle" size={32} color="#c9f158" />
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mt-2">
              Your program is ready
            </Text>
            <Text className="font-secondary text-gray-600 dark:text-gray-400 text-center mt-1">
              One exercise per session. Follow the guidance. Build your
              strength.
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
