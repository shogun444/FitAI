import { Button, Card, Heading, Subheading } from "@/components";
import { useWorkoutStore } from "@/store";
import { Exercise, WorkoutSession } from "@/types";
import { Href, Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// Last Session Component
// ============================================

interface LastSessionProps {
  workout: WorkoutSession;
}

function LastSession({ workout }: LastSessionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Only show exercises with completed sets
  const exercisesWithSets = workout.exercises.filter((ex) =>
    ex.sets.some((s) => s.completed),
  );

  if (exercisesWithSets.length === 0) {
    return null;
  }

  return (
    <Card  className="mt-4">
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        className="flex-row justify-between items-center"
      >
        <View>
          <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
            Last Session
          </Text>
          <Text className="font-secondary text-xs text-gray-500">
            {formatDate(workout.startedAt)} · {formatDuration(workout.duration)}
          </Text>
        </View>
        <Text className="font-secondary text-gray-400 text-sm">
          {isExpanded ? "▼" : "▶"}
        </Text>
      </Pressable>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {exercisesWithSets.map((exercise) => (
            <LastSessionExercise key={exercise.id} exercise={exercise} />
          ))}
        </View>
      )}
    </Card>
  );
}

function LastSessionExercise({ exercise }: { exercise: Exercise }) {
  const completedSets = exercise.sets.filter((s) => s.completed);

  return (
    <View className="mb-3 last:mb-0">
      <Text className="font-primaryMedium text-sm text-gray-900 dark:text-white mb-1">
        {exercise.name}
      </Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-1">
        {completedSets.map((set, index) => (
          <Text key={set.id} className="font-secondary text-xs text-gray-500">
            Set {set.weight ?? 0}kg × {set.reps ?? 0} reps
          </Text>
        ))}
      </View>
    </View>
  );
}

// ============================================
// Main Home Screen
// ============================================

export default function HomeScreen() {
  const router = useRouter();
  const { currentWorkout, pastWorkouts, loadWorkouts } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Get the most recent completed workout (not the current one)
  const lastSession = useMemo(() => {
    if (pastWorkouts.length === 0) return null;
    return pastWorkouts[0]; // pastWorkouts is already sorted newest first
  }, [pastWorkouts]);

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
        <Subheading className="text-lg mb-8">
          Your AI-powered fitness companion
        </Subheading>

        <View className="gap-4">
          {currentWorkout ? (
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Workout in Progress
              </Text>
              <Text className="font-secondary text-gray-500 mb-4">
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

        {/* Recent Workouts Section */}
        {pastWorkouts.length > 0 && (
          <View className="mt-8">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1">
              Recent Workouts
            </Text>
            <Text className="font-secondary text-gray-500">
              {pastWorkouts.length} workout
              {pastWorkouts.length !== 1 ? "s" : ""} completed
            </Text>

            {/* Last Session - immediately below Recent Workouts */}
            {lastSession && <LastSession workout={lastSession} />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
