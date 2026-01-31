import { AutoAdvanceNumberInputRef, Card } from "@/components/ui";
import { useWorkoutStore } from "@/store";
import { Exercise } from "@/types";
import React, { createRef, memo, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { LastSessionSummary } from "./LastSessionSummary";
import { SetRow } from "./SetRow";

interface ExerciseItemProps {
  exercise: Exercise;
}

/**
 * Exercise card with sets list and auto-advance focus.
 * Memoized to prevent re-renders when other exercises change.
 */
export const ExerciseItem = memo(function ExerciseItem({
  exercise,
}: ExerciseItemProps) {
  const { removeExercise, addSet, toggleSetCompleted } = useWorkoutStore();

  // Create refs for each set's weight input (for auto-advance: kg → reps → next kg)
  const setRefs = useMemo(
    () => exercise.sets.map(() => createRef<AutoAdvanceNumberInputRef>()),
    [exercise.sets.length],
  );

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

      {/* Sets Rows */}
      <View className="gap-2 mt-3">
        {exercise.sets.map((set, index) => {
          const isLastSet = index === exercise.sets.length - 1;
          const nextRef = isLastSet ? undefined : setRefs[index + 1];

          return (
            <SetRow
              key={set.id}
              ref={setRefs[index]}
              exerciseId={exercise.id}
              set={set}
              index={index}
              onFocus={() => handleSetFocus(index)}
              nextWeightInputRef={nextRef}
              isLastSet={isLastSet}
            />
          );
        })}
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
