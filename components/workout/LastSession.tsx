import { Card } from "@/components/ui/Card";
import { EXERCISE_CATALOG } from "@/data/exercises";
import { PULLUP_PROGRAM_EXERCISES } from "@/data/pullup-program";
import { formatSetDisplay } from "@/lib/formatters";
import { Exercise, WorkoutSession } from "@/types";
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
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

// ============================================
// LastSessionExercise Component
// ============================================

function LastSessionExercise({ exercise }: { exercise: Exercise }) {
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
            {formatSetDisplay(index + 1, set.weight, set.reps, {
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
// LastSession Component
// ============================================

interface LastSessionProps {
  workout: WorkoutSession;
}

export function LastSession({ workout }: LastSessionProps) {
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
