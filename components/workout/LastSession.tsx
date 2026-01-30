import { Card } from "@/components/ui/Card";
import { Exercise, WorkoutSession } from "@/types";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

// ============================================
// Helpers
// ============================================

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

  return (
    <View className="mb-3 last:mb-0">
      <Text className="font-primaryMedium text-sm text-gray-900 dark:text-white mb-1.5">
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
    <Card className="mt-4">
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
        <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {exercisesWithSets.map((exercise) => (
            <LastSessionExercise key={exercise.id} exercise={exercise} />
          ))}
        </View>
      )}
    </Card>
  );
}
