import { Button, Card, Heading, Subheading } from "@/components";
import { PROGRAMS } from "@/data/programs";
import { PULLUP_PROGRAM } from "@/data/pullup-program";
import { formatDuration, TIMED_WORKOUTS } from "@/data/timed-workouts";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { useWorkoutStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutTabScreen() {
  const router = useRouter();
  const { currentWorkout } = useWorkoutStore();
  const { hasStarted, isCompleted, completedSessionsCount, targetSessions } =
    usePullupProgram();
  const {
    program: activeProgram,
    hasActiveProgram,
    hasSessionInProgress,
  } = useProgramInstance();

  const handleStartWorkout = () => {
    router.push("/workout/select-exercises" as Href);
  };

  const handleContinueWorkout = () => {
    router.push("/workout/session" as Href);
  };

  // Calculate pullup program progress
  const pullupSessionsCompleted = completedSessionsCount;
  const pullupTotalSessions = targetSessions;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-2">Workout</Heading>
        <Subheading className="mb-8">Track your fitness journey</Subheading>

        {currentWorkout ? (
          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Workout in Progress
            </Text>
            <Text className="font-secondary text-gray-500 mb-1">
              {currentWorkout.exercises.length} exercise
              {currentWorkout.exercises.length !== 1 ? "s" : ""} added
            </Text>
            <Text className="font-secondary text-gray-500 mb-4">
              {currentWorkout.exercises.reduce(
                (acc, ex) => acc + ex.sets.length,
                0,
              )}{" "}
              total sets
            </Text>
            <Button title="Continue Workout" onPress={handleContinueWorkout} />
          </Card>
        ) : (
          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Ready to train?
            </Text>
            <Text className="font-secondary text-gray-500 mb-4">
              Start a new workout session and track your exercises, sets, and
              rest periods.
            </Text>
            <Button title="Start New Workout" onPress={handleStartWorkout} />
          </Card>
        )}

        {/* ============================================ */}
        {/* Programs Section */}
        {/* ============================================ */}
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3 mt-4">
          Programs
        </Text>

        {/* Free Program: Unlock Your First Pull-up */}
        <Pressable
          onPress={() => router.push("/pullup-program" as Href)}
          className="mb-3"
        >
          <Card className="border-2 border-primary/30">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center mr-3">
                <Ionicons name="fitness" size={24} color="#c9f158" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                    {PULLUP_PROGRAM.name}
                  </Text>
                  <View className="bg-primary/20 px-2 py-0.5 rounded-full ml-2">
                    <Text className="font-secondaryMedium text-xs text-primary">
                      FREE
                    </Text>
                  </View>
                </View>
                <Text
                  className="font-secondary text-sm text-gray-500 mb-2"
                  numberOfLines={2}
                >
                  {PULLUP_PROGRAM.description}
                </Text>

                {/* Progress indicator */}
                {hasStarted && !isCompleted && (
                  <View className="flex-row items-center">
                    <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                      <View
                        className="h-1.5 bg-primary rounded-full"
                        style={{
                          width: `${(pullupSessionsCompleted / pullupTotalSessions) * 100}%`,
                        }}
                      />
                    </View>
                    <Text className="font-secondary text-xs text-gray-500">
                      {pullupSessionsCompleted}/{pullupTotalSessions}
                    </Text>
                  </View>
                )}
                {isCompleted && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#22c55e"
                    />
                    <Text className="font-secondaryMedium text-xs text-green-500 ml-1">
                      Completed
                    </Text>
                  </View>
                )}
                {!hasStarted && (
                  <Text className="font-secondary text-xs text-primary">
                    Tap to start →
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Paid Programs */}
        {PROGRAMS.map((program) => {
          const isActive =
            hasActiveProgram && activeProgram?.programId === program.id;
          const sessionNumber = isActive
            ? (activeProgram?.sessionIndex ?? 0) + 1
            : 0;
          const totalSessions = 24; // 12 weeks × 2 sessions

          return (
            <Pressable
              key={program.id}
              onPress={() => router.push(`/program/${program.id}` as Href)}
              className="mb-3"
            >
              <Card className={isActive ? "border-2 border-primary/30" : ""}>
                <View className="flex-row items-start">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      isActive
                        ? "bg-primary/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Ionicons
                      name="barbell"
                      size={24}
                      color={isActive ? "#c9f158" : "#9ca3af"}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                        {program.name}
                      </Text>
                      {isActive ? (
                        <View className="bg-primary/20 px-2 py-0.5 rounded-full ml-2">
                          <Text className="font-secondaryMedium text-xs text-primary">
                            ACTIVE
                          </Text>
                        </View>
                      ) : (
                        program.isPaid && (
                          <View className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-2">
                            <Text className="font-secondaryMedium text-xs text-gray-600 dark:text-gray-400">
                              PRO
                            </Text>
                          </View>
                        )
                      )}
                    </View>

                    {isActive ? (
                      <>
                        <Text className="font-secondary text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Week {Math.ceil(sessionNumber / 2)} • Session{" "}
                          {sessionNumber}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <View
                              className="h-1.5 bg-primary rounded-full"
                              style={{
                                width: `${(sessionNumber / totalSessions) * 100}%`,
                              }}
                            />
                          </View>
                          <Text className="font-secondary text-xs text-gray-500">
                            {sessionNumber}/{totalSessions}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text className="font-secondary text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {program.tagline}
                        </Text>
                        <Text className="font-secondary text-xs text-gray-500">
                          {program.frequency} • {program.level}
                        </Text>
                      </>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Card>
            </Pressable>
          );
        })}

        {/* Timed Follow-Along Workouts */}
        {TIMED_WORKOUTS.map((timedWorkout) => (
          <Pressable
            key={timedWorkout.id}
            onPress={() =>
              router.push(`/timed-workout/${timedWorkout.id}` as Href)
            }
            className="mb-3"
          >
            <Card>
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="flame" size={24} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                      {timedWorkout.name}
                    </Text>
                    <View className="bg-primary/20 px-2 py-0.5 rounded-full ml-2">
                      <Text className="font-secondaryMedium text-xs text-primary">
                        FREE
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="font-secondary text-sm text-gray-500 mb-1"
                    numberOfLines={2}
                  >
                    {timedWorkout.description}
                  </Text>
                  <Text className="font-secondary text-xs text-amber-600">
                    {formatDuration(timedWorkout.totalDuration)} • Follow Along
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Card>
          </Pressable>
        ))}

        {/* Spacer before history */}
        <View className="h-2" />

        <Pressable
          onPress={() => router.push("/workout/history" as Href)}
          className="mt-2"
        >
          <Card>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
                  Workout History
                </Text>
                <Text className="font-secondary text-gray-500">
                  View your past workouts
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
