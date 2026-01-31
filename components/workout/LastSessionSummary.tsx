import { useWorkoutStore } from "@/store";
import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface LastSessionSummaryProps {
  exerciseName: string;
}

export const LastSessionSummary = memo(function LastSessionSummary({
  exerciseName,
}: LastSessionSummaryProps) {
  const { getLastSessionForExercise } = useWorkoutStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const lastSession = getLastSessionForExercise(exerciseName);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!lastSession) {
    return null;
  }

  const workingSets = lastSession.sets.filter((set) => set.completed);

  if (workingSets.length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={toggleExpanded}
      className="mb-3 border-t border-gray-200 dark:border-gray-700 pt-3"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-secondaryMedium text-xs text-gray-500 uppercase tracking-wide">
          Last Session ({workingSets.length} sets)
        </Text>
        <Text className="font-secondary text-gray-400 text-xs">
          {isExpanded ? "▼" : "▶"}
        </Text>
      </View>

      {isExpanded && (
        <View className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
          {workingSets.map((set, index) => (
            <View key={set.id} className="flex-row py-1.5">
              <Text className="flex-1 font-secondary text-xs text-gray-600 dark:text-gray-400">
                Set {index + 1}
              </Text>
              <Text className="flex-1 font-secondaryMedium text-xs text-gray-700 dark:text-gray-300 text-right">
                {set.reps ?? 0} reps × {set.weight ?? 0} kg
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
});
