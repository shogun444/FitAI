import { Button, Card, Heading, Subheading } from "@/components";
import {
  ActiveProgramCard,
  ActivePullupProgramCard,
  ProgramCard,
} from "@/components/programs";
import { LastSession } from "@/components/workout";
import { PROGRAMS } from "@/data/programs";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { useWorkoutStore } from "@/store";
import { Href, Link, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { currentWorkout, pastWorkouts, loadWorkouts } = useWorkoutStore();
  const {
    program,
    loading: programLoading,
    getTodaySession,
    hasActiveProgram,
  } = useProgramInstance();

  // Pull-up program state
  const {
    hasStarted: hasPullupProgram,
    isCompleted: isPullupCompleted,
    completedSessionsCount,
    targetSessions,
    hasActiveSession: hasPullupActiveSession,
    isLoading: pullupLoading,
  } = usePullupProgram();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const lastSession = useMemo(() => {
    if (pastWorkouts.length === 0) return null;
    return pastWorkouts[0];
  }, [pastWorkouts]);

  const todaySession = useMemo(() => {
    if (!hasActiveProgram) return null;
    return getTodaySession();
  }, [hasActiveProgram, getTodaySession]);

  const handleStartWorkout = () => {
    router.push("/workout/select-exercises" as Href);
  };

  const handleContinueWorkout = () => {
    router.push("/workout/session" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="text-4xl mb-2">fitAI</Heading>
        <Subheading className="text-lg mb-10">
          Your AI-powered fitness companion
        </Subheading>

        <View className="gap-4">
          {/* Active Program Section - Weighted Calisthenics */}
          {hasActiveProgram && program && todaySession && (
            <ActiveProgramCard program={program} todaySession={todaySession} />
          )}

          {/* Active Program Section - Pull-up Program */}
          {hasPullupProgram && !isPullupCompleted && !pullupLoading && (
            <ActivePullupProgramCard
              completedSessions={completedSessionsCount}
              targetSessions={targetSessions}
              hasActiveSession={hasPullupActiveSession}
            />
          )}

          {currentWorkout ? (
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2 tracking-tight">
                Workout in Progress
              </Text>
              <Text className="font-primary text-gray-400 text-sm mb-4">
                {currentWorkout.exercises.length} exercises added
              </Text>
              <Button
                title="Continue Workout"
                onPress={handleContinueWorkout}
              />
            </Card>
          ) : (
            <Button title="Start Workout" onPress={handleStartWorkout} />
          )}

          <Link href={"/workout/history" as Href} asChild>
            <Button title="View History" variant="secondary" />
          </Link>
        </View>

        {/* Only show program cards if no active program */}
        {!hasActiveProgram && (
          <View className="my-6">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4 tracking-tight">
              Workout Programs
            </Text>
            <View className="gap-4">
              {PROGRAMS.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={() => router.push(`/program/${program.id}` as Href)}
                />
              ))}
            </View>
          </View>
        )}

        {pastWorkouts.length > 0 && (
          <View className="my-10">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1 tracking-tight">
              Recent Workouts
            </Text>
            <Text className="font-primary text-gray-400 text-sm">
              {pastWorkouts.length} workout
              {pastWorkouts.length !== 1 ? "s" : ""} completed
            </Text>

            {lastSession && <LastSession workout={lastSession} />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
