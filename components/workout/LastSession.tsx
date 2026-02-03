import { Card } from "@/components/ui/Card";
import { EXERCISE_CATALOG } from "@/data/exercises";
import { PULLUP_PROGRAM_EXERCISES } from "@/data/pullup-program";
import { formatSetDisplay } from "@/lib/formatters";
import { Exercise, WorkoutSession } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

// ============================================
// Helpers
// ============================================

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

function isTimeExercise(exerciseName: string): boolean {
  const pullupExercise = PULLUP_PROGRAM_EXERCISES.find(
    (e) => e.name.toLowerCase() === exerciseName.toLowerCase(),
  );
  return pullupExercise?.targetType === "time";
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
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

// ============================================
// LastSessionExercise Component
// ============================================

function LastSessionExercise({
  exercise,
  isTimedWorkout,
}: {
  exercise: Exercise;
  isTimedWorkout?: boolean;
}) {
  const completedSets = exercise.sets.filter((s) => s.completed);
  const isBodyweight = isBodyweightExercise(exercise.name);
  const isTime = isTimeExercise(exercise.name);

  return (
    <Pressable onPress={() => router.push("/workout/history")}>
      <View className="mb-2">
        <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-1">
          • {exercise.name} ({completedSets.length} sets)
        </Text>
        {completedSets.map((set, index) => (
          <Text
            key={set.id}
            className="font-secondary text-xs text-gray-500 dark:text-gray-500 ml-4"
          >
            {isTimedWorkout && set.time != null
              ? `Set${index + 1} : ${set.time}s`
              : formatSetDisplay(index + 1, set.weight, set.reps, {
                  isBodyweight,
                  isTimeExercise: isTime,
                })}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

// ============================================
// TimedWorkoutLastSession Component
// ============================================

function TimedWorkoutLastSession({ workout }: { workout: WorkoutSession }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completionPercent = workout.totalTimePlanned
    ? Math.min(
        100,
        Math.round(
          ((workout.totalTimeCompleted || 0) / workout.totalTimePlanned) * 100,
        ),
      )
    : 100;

  return (
    <Card className="mt-4">
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        className="flex-row justify-between items-center"
      >
        <View className="flex-1">
          <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
            {formatDate(workout.startedAt)}
          </Text>
          <Text className="font-secondaryMedium text-xs text-primary-600 dark:text-primary-400 mt-0.5">
            {workout.programName}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="font-secondaryMedium text-gray-500 mr-2">
            {formatDuration(workout.duration)}
          </Text>
          <Text className="font-secondary text-gray-400 text-sm">
            {isExpanded ? "▼" : "▶"}
          </Text>
        </View>
      </Pressable>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Time stats */}
          <View className="flex-row gap-4 mb-3">
            <View>
              <Text className="font-secondary text-sm text-gray-500">
                Planned
              </Text>
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
        </View>
      )}
    </Card>
  );
}

// ============================================
// LastSession Component
// ============================================

interface LastSessionProps {
  workout: WorkoutSession;
}

export function LastSession({ workout }: LastSessionProps) {
  // Route timed workouts to their own card style
  if (workout.isTimedWorkout) {
    return <TimedWorkoutLastSession workout={workout} />;
  }

  const [isExpanded, setIsExpanded] = useState(true);

  const exercisesWithSets = workout.exercises.filter((ex) =>
    ex.sets.some((s) => s.completed),
  );

  if (exercisesWithSets.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 ">
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        className="flex-row justify-between items-center"
      >
        <View>
          <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
            Last Session
          </Text>
          <Text className="font-secondary text-xs text-gray-500 mt-0.5">
            {formatDate(workout.startedAt)} · {formatDuration(workout.duration)}
          </Text>
        </View>
        <Text className="font-secondary text-gray-400 text-sm">
          {isExpanded ? "▼" : "▶"}
        </Text>
      </Pressable>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {exercisesWithSets.map((exercise) => (
            <LastSessionExercise key={exercise.id} exercise={exercise} />
          ))}
        </View>
      )}
    </Card>
  );
}
