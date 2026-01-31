import {
  AutoAdvanceNumberInput,
  AutoAdvanceNumberInputRef,
} from "@/components/ui";
import { useWorkoutStore } from "@/store";
import { WorkoutSet } from "@/types";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface SetRowProps {
  exerciseId: string;
  set: WorkoutSet;
  index: number;
  onFocus?: () => void;
  /** Ref to the next set's weight input (for auto-advance from reps → next kg) */
  nextWeightInputRef?: React.RefObject<AutoAdvanceNumberInputRef | null>;
  /** If true, this is the last set (dismisses keyboard) */
  isLastSet?: boolean;
}

/**
 * Set row for free workouts with auto-advance inputs.
 *
 * FOCUS FLOW: kg → reps → next set's kg
 *
 * Features:
 * - Auto-advance focus: kg → reps → next kg
 * - Always editable (no locking)
 * - Completion derived from values (reps + weight filled)
 * - Manual checkmark toggle
 * - Remove set option
 */
export const SetRow = memo(
  forwardRef<AutoAdvanceNumberInputRef, SetRowProps>(function SetRow(
    { exerciseId, set, index, onFocus, nextWeightInputRef, isLastSet = false },
    ref,
  ) {
    const { updateSet, toggleSetCompleted, removeSet } = useWorkoutStore();
    const [weight, setWeight] = useState(set.weight?.toString() ?? "");
    const [isEditing, setIsEditing] = useState(false);

    // Internal refs for focus chaining
    const weightInputRef = useRef<TextInput>(null);
    const repsInputRef = useRef<AutoAdvanceNumberInputRef>(null);

    // Expose the WEIGHT input via ref (so reps can advance to next set's kg)
    useImperativeHandle(ref, () => ({
      focus: () => weightInputRef.current?.focus(),
      blur: () => weightInputRef.current?.blur(),
    }));

    // Derive states
    const isCompleted = set.completed;
    const isReadyToComplete = set.reps !== null && set.weight !== null;

    // Determine row styling based on state
    const getRowStyle = () => {
      if (isCompleted && !isEditing) {
        return "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800";
      }
      if (isEditing) {
        return "bg-white dark:bg-gray-800 border-primary-500";
      }
      return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    };

    // Determine input styling based on state
    const getInputStyle = () => {
      if (isCompleted && !isEditing) {
        return "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400";
      }
      if (isEditing) {
        return "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-primary-300 dark:border-primary-600";
      }
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
    };

    const handleRepsChange = useCallback(
      (reps: number) => {
        const parsed = reps === 0 ? null : reps;
        updateSet(exerciseId, set.id, parsed, set.weight);
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
        // No auto-advance from kg - weight can be 2-3 digits
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

    return (
      <View
        className={`flex-row items-center px-3 py-3 rounded-xl border ${getRowStyle()}`}
      >
        {/* Set number badge */}
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            isCompleted && !isEditing
              ? "bg-primary-500"
              : isEditing
                ? "bg-primary-100 dark:bg-primary-900/30"
                : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`font-primaryBold text-sm ${
              isCompleted && !isEditing
                ? "text-white"
                : isEditing
                  ? "text-primary-600"
                  : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {index + 1}
          </Text>
        </View>

        {/* Weight input (kg first for WEIGHT → REPS standard) */}
        <View className="flex-row items-center flex-1">
          <TextInput
            ref={weightInputRef}
            value={weight}
            onChangeText={handleWeightChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="—"
            keyboardType="decimal-pad"
            placeholderTextColor="#9ca3af"
            selectTextOnFocus
            className={`w-16 h-12 px-2 py-2 text-center rounded-lg font-primaryBold text-lg ${getInputStyle()}`}
          />
          <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs ml-1">
            kg
          </Text>
        </View>

        {/* Reps input */}
        <View className="flex-row items-center flex-1">
          <AutoAdvanceNumberInput
            ref={repsInputRef}
            value={set.reps}
            onChange={handleRepsChange}
            nextInputRef={nextWeightInputRef}
            isLast={isLastSet}
            placeholder="—"
            placeholderTextColor="#9ca3af"
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-16 h-12 px-2 py-2 text-center rounded-lg font-primaryBold text-lg ${getInputStyle()}`}
          />
          <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs ml-1">
            reps
          </Text>
        </View>

        {/* Complete checkmark */}
        <Pressable
          onPress={handleComplete}
          disabled={!isReadyToComplete && !isCompleted}
          className="w-10 h-10 items-center justify-center"
        >
          <View
            className={`w-7 h-7 rounded-full items-center justify-center ${
              isCompleted
                ? "bg-green-500"
                : isReadyToComplete
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Text
              className={`text-sm ${
                isCompleted
                  ? "text-white"
                  : isReadyToComplete
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-300 dark:text-gray-600"
              }`}
            >
              ✓
            </Text>
          </View>
        </Pressable>

        {/* Remove button */}
        <Pressable
          onPress={handleRemove}
          className="w-8 h-10 items-center justify-center ml-1"
        >
          <Text className="text-red-400 text-xs">✕</Text>
        </Pressable>
      </View>
    );
  }),
);
