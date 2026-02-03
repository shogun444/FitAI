import { Card, ScreenHeader, Subheading } from "@/components";
import { EXERCISE_CATALOG } from "@/data/exercises";
import { PULLUP_PROGRAM_EXERCISES } from "@/data/pullup-program";
import { formatSetDisplay } from "@/lib/formatters";
import { useWorkoutStore } from "@/store";
import { WorkoutSession } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper to check if an exercise is bodyweight from catalog or pullup program
function isBodyweightExercise(exerciseName: string): boolean {
  // Check if it's a pullup program exercise (all are bodyweight)
  const pullupExercise = PULLUP_PROGRAM_EXERCISES.find(
    (e) => e.name.toLowerCase() === exerciseName.toLowerCase(),
  );
  if (pullupExercise) return true;

  // Check catalog exercises
  const catalogExercise = EXERCISE_CATALOG.find(
    (e) => e.name.toLowerCase() === exerciseName.toLowerCase(),
  );
  return catalogExercise?.allowsExternalLoad === false;
}

// Helper to check if an exercise is time-based
function isTimeExercise(exerciseName: string): boolean {
  const pullupExercise = PULLUP_PROGRAM_EXERCISES.find(
    (e) => e.name.toLowerCase() === exerciseName.toLowerCase(),
  );
  return pullupExercise?.targetType === "time";
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0 && secs > 0) {
    return `${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${secs}s`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Card for timed follow-along workouts (like "5 Min Killer Abs")
 */
function TimedWorkoutCard({ workout }: { workout: WorkoutSession }) {
  const completionPercent = workout.totalTimePlanned
    ? Math.round(
        ((workout.totalTimeCompleted || 0) / workout.totalTimePlanned) * 100,
      )
    : 100;

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            {formatDate(workout.startedAt)}
          </Text>
          <Text className="font-secondaryMedium text-xs text-primary-600 dark:text-primary-400 mt-0.5">
            {workout.programName}
          </Text>
        </View>
        <Text className="font-secondaryMedium text-gray-500">
          {formatDuration(workout.duration)}
        </Text>
      </View>

      {/* Progression summary */}
      {workout.progressionSummary && (
        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-3 py-2 mb-3">
          <Text className="font-secondary text-sm text-primary-700 dark:text-primary-300">
            {workout.progressionSummary}
          </Text>
        </View>
      )}

      {/* Time stats for timed workouts */}
      <View className="flex-row gap-4 mb-3">
        <View>
          <Text className="font-secondary text-sm text-gray-500">Planned</Text>
          <Text className="font-primarySemiBold text-gray-900 dark:text-white">
            {formatDuration(workout.totalTimePlanned || 0)}
          </Text>
        </View>
        <View>
          <Text className="font-secondary text-sm text-gray-500">
            Completed
          </Text>
          <Text className="font-primarySemiBold text-gray-900 dark:text-white">
            {formatDuration(workout.totalTimeCompleted || 0)}
          </Text>
        </View>
        <View>
          <Text className="font-secondary text-sm text-gray-500">
            Completion
          </Text>
          <View className="flex-row items-center">
            <Text className="font-primarySemiBold text-gray-900 dark:text-white">
              {completionPercent}%
            </Text>
            {completionPercent >= 100 && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#22c55e"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>

      {/* Exercise list with time-based sets */}
      {workout.exercises.length > 0 && (
        <View className="pt-3 border-t border-gray-200 dark:border-gray-700">
          {workout.exercises.map((ex) => (
            <View key={ex.id} className="mb-2">
              <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-1">
                • {ex.name}
              </Text>
              {ex.sets.map((set, idx) => (
                <Text
                  key={set.id}
                  className="font-secondary text-xs text-gray-500 dark:text-gray-500 ml-4"
                >
                  Set{idx + 1} : {set.time}s
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

/**
 * Card for regular strength workouts (sets/reps/weight)
 */
function WorkoutCard({ workout }: { workout: WorkoutSession }) {
  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0,
  );
  const completedSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
            {formatDate(workout.startedAt)}
          </Text>
          {/* Program workout label */}
          {workout.isProgramWorkout && (
            <Text className="font-secondaryMedium text-xs text-primary-600 dark:text-primary-400 mt-0.5">
              {workout.programName} • Session {workout.sessionIndex}
            </Text>
          )}
        </View>
        <Text className="font-secondaryMedium text-gray-500">
          {formatDuration(workout.duration)}
        </Text>
      </View>

      {/* Progression summary for program workouts */}
      {workout.isProgramWorkout && workout.progressionSummary && (
        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-3 py-2 mb-3">
          <Text className="font-secondary text-sm text-primary-700 dark:text-primary-300">
            {workout.progressionSummary}
          </Text>
        </View>
      )}

      <View className="flex-row gap-4">
        <View>
          <Text className="font-secondary text-sm text-gray-500">
            Exercises
          </Text>
          <Text className="font-primarySemiBold text-gray-900 dark:text-white">
            {workout.exercises.length}
          </Text>
        </View>
        <View>
          <Text className="font-secondary text-sm text-gray-500">Sets</Text>
          <Text className="font-primarySemiBold text-gray-900 dark:text-white">
            {completedSets}/{totalSets}
          </Text>
        </View>
      </View>

      {workout.exercises.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {workout.exercises.map((ex) => {
            const isBodyweight = isBodyweightExercise(ex.name);
            const isTime = isTimeExercise(ex.name);
            return (
              <View key={ex.id} className="mb-2">
                <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-1">
                  • {ex.name} ({ex.sets.length} sets)
                </Text>
                {ex.sets.map((set, idx) => (
                  <Text
                    key={set.id}
                    className="font-secondary text-xs text-gray-500 dark:text-gray-500 ml-4"
                  >
                    {formatSetDisplay(idx + 1, set.weight, set.reps, {
                      isBodyweight,
                      isTimeExercise: isTime,
                    })}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

export default function HistoryScreen() {
  const { pastWorkouts, loadWorkouts } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header - unified ScreenHeader component */}
      <ScreenHeader title="Workout History" />

      <ScrollView className="flex-1 p-4">
        <Subheading className="mb-6">Your past workouts</Subheading>

        {pastWorkouts.length === 0 ? (
          <Card>
            <Text className="font-secondary text-gray-500 text-center py-8">
              No workouts yet. Start your first workout!
            </Text>
          </Card>
        ) : (
          pastWorkouts.map((workout) =>
            workout.isTimedWorkout ? (
              <TimedWorkoutCard key={workout.id} workout={workout} />
            ) : (
              <WorkoutCard key={workout.id} workout={workout} />
            ),
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
