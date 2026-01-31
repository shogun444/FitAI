import { useWorkoutStore } from "@/store";
import { WorkoutSet } from "@/types";
import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface SetRowProps {
  exerciseId: string;
  set: WorkoutSet;
  index: number;
  onFocus?: () => void;
}

export const SetRow = memo(function SetRow({
  exerciseId,
  set,
  index,
  onFocus,
}: SetRowProps) {
  const { updateSet, toggleSetCompleted, removeSet } = useWorkoutStore();
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const handleRepsChange = useCallback(
    (value: string) => {
      setReps(value);
      const parsed = value === "" ? null : parseInt(value, 10);
      if (parsed === null || !isNaN(parsed)) {
        updateSet(exerciseId, set.id, parsed, set.weight);
      }
    },
    [updateSet, exerciseId, set.id, set.weight],
  );

  const handleWeightChange = useCallback(
    (value: string) => {
      setWeight(value);
      const parsed = value === "" ? null : parseFloat(value);
      if (parsed === null || !isNaN(parsed)) {
        updateSet(exerciseId, set.id, set.reps, parsed);
      }
    },
    [updateSet, exerciseId, set.id, set.reps],
  );

  const handleComplete = useCallback(() => {
    if (set.reps !== null && set.weight !== null) {
      toggleSetCompleted(exerciseId, set.id);
    }
  }, [toggleSetCompleted, exerciseId, set.id, set.reps, set.weight]);

  const handleFocus = useCallback(() => {
    if (set.completed) {
      toggleSetCompleted(exerciseId, set.id);
    }
    setIsEditing(true);
    onFocus?.();
  }, [set.completed, toggleSetCompleted, exerciseId, set.id, onFocus]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleRemove = useCallback(() => {
    removeSet(exerciseId, set.id);
  }, [removeSet, exerciseId, set.id]);

  const isReadyToComplete = set.reps !== null && set.weight !== null;
  const showGreenBackground = set.completed && !isEditing;

  return (
    <View
      className={`flex-row items-center py-2.5 rounded-lg ${
        showGreenBackground ? "bg-primary/20" : ""
      }`}
    >
      <Text className="w-12 font-secondaryMedium text-gray-900 dark:text-white text-center">
        {index + 1}
      </Text>
      <TextInput
        value={reps}
        onChangeText={handleRepsChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="—"
        keyboardType="number-pad"
        placeholderTextColor="#9ca3af"
        className={`flex-1 font-secondary text-center py-2 mx-1 rounded-lg ${
          showGreenBackground
            ? "text-gray-900 dark:text-white bg-transparent"
            : "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
        }`}
      />
      <TextInput
        value={weight}
        onChangeText={handleWeightChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="—"
        keyboardType="decimal-pad"
        placeholderTextColor="#9ca3af"
        className={`flex-1 font-secondary text-center py-2 mx-1 rounded-lg ${
          showGreenBackground
            ? "text-gray-900 dark:text-white bg-transparent"
            : "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
        }`}
      />
      <Pressable
        onPress={handleComplete}
        disabled={!isReadyToComplete && !set.completed}
        className="w-12 h-10 items-center justify-center"
      >
        <Text
          className={`text-lg ${
            set.completed
              ? "text-green-600"
              : isReadyToComplete
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-300 dark:text-gray-700"
          }`}
        >
          {set.completed ? "✓" : "○"}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleRemove}
        className="w-10 h-10 items-center justify-center"
      >
        <Text className="text-red-500 text-sm">✕</Text>
      </Pressable>
    </View>
  );
});
