import { Card } from "@/components/ui/Card";
import { useWorkoutStore } from "@/store";
import { Exercise } from "@/types";
import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { LastSessionSummary } from "./LastSessionSummary";
import { SetRow } from "./SetRow";

interface ExerciseItemProps {
  exercise: Exercise;
}

/**
 * Exercise card with sets list.
 * Memoized to prevent re-renders when other exercises change.
 */
export const ExerciseItem = memo(function ExerciseItem({
  exercise,
}: ExerciseItemProps) {
  const { removeExercise, addSet, toggleSetCompleted } = useWorkoutStore();

  const handleSetFocus = useCallback(
    (currentIndex: number) => {
      if (currentIndex > 0) {
        const previousSet = exercise.sets[currentIndex - 1];
        if (
          previousSet &&
          !previousSet.completed &&
          previousSet.reps !== null &&
          previousSet.weight !== null
        ) {
          toggleSetCompleted(exercise.id, previousSet.id);
        }
      }
    },
    [exercise.sets, exercise.id, toggleSetCompleted],
  );

  const handleRemove = useCallback(() => {
    removeExercise(exercise.id);
  }, [removeExercise, exercise.id]);

  const handleAddSet = useCallback(() => {
    addSet(exercise.id);
  }, [addSet, exercise.id]);

  return (
    <Card className="mb-3">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          {exercise.name}
        </Text>
        <Pressable onPress={handleRemove} className="px-3 py-1">
          <Text className="font-secondaryMedium text-red-500 text-sm">
            Remove
          </Text>
        </Pressable>
      </View>

      {/* Last Session Reference */}
      <LastSessionSummary exerciseName={exercise.name} />

      {/* Sets Table Header */}
      <View className="flex-row mb-2 mt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Text className="w-12 font-secondaryMedium text-gray-500 text-center text-xs uppercase tracking-wide">
          Set
        </Text>
        <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-xs uppercase tracking-wide">
          Reps
        </Text>
        <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-xs uppercase tracking-wide">
          kg
        </Text>
        <Text className="w-12 font-secondaryMedium text-gray-500 text-center text-xs uppercase tracking-wide">
          Done
        </Text>
        <Text className="w-10" />
      </View>

      {/* Sets Rows */}
      <View className="gap-1">
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            exerciseId={exercise.id}
            set={set}
            index={index}
            onFocus={() => handleSetFocus(index)}
          />
        ))}
      </View>

      {/* Add Set Button */}
      <Pressable
        onPress={handleAddSet}
        className="mt-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl"
      >
        <Text className="font-secondaryMedium text-gray-500 text-center text-sm">
          + Add working set
        </Text>
      </Pressable>
    </Card>
  );
});
