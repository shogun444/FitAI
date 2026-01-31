import {
  AutoAdvanceNumberInput,
  AutoAdvanceNumberInputRef,
} from "@/components/ui";
import React, { forwardRef, memo } from "react";
import { Text, View } from "react-native";

export interface ProgramSetRowProps {
  setNumber: number;
  prescribedReps: number;
  repsCompleted: number | null;
  isActive: boolean;
  onRepsChange: (reps: number) => void;
  /** Previous session reps for this set (null if first session or set didn't exist) */
  previousReps?: number | null;
  /** Previous session weight (null if first session) */
  previousWeight?: number | null;
  /** Ref to the next set's input (for auto-advance) */
  nextInputRef?: React.RefObject<AutoAdvanceNumberInputRef | null>;
  /** If true, this is the last set (dismisses keyboard instead of advancing) */
  isLastSet?: boolean;
}

/**
 * Single set row for program workouts.
 *
 * - Displays set number and prescribed reps
 * - Number input with auto-advance to next set
 * - Visual states: pending, active, completed
 * - Set is "completed" when reps > 0 (derived, not flagged)
 * - ALWAYS editable - no locking
 *
 * Memoized to prevent re-renders when sibling sets change.
 */
export const ProgramSetRow = memo(
  forwardRef<AutoAdvanceNumberInputRef, ProgramSetRowProps>(
    function ProgramSetRow(
      {
        setNumber,
        prescribedReps,
        repsCompleted,
        isActive,
        onRepsChange,
        previousReps,
        previousWeight,
        nextInputRef,
        isLastSet = false,
      },
      ref,
    ) {
      // Derive completion from value (no flags)
      const isCompleted = repsCompleted !== null && repsCompleted > 0;
      const hitTarget =
        repsCompleted !== null && repsCompleted >= prescribedReps;

      // Check if we have valid previous set data
      const hasPreviousData =
        previousReps !== null &&
        previousReps !== undefined &&
        previousReps > 0 &&
        previousWeight !== null &&
        previousWeight !== undefined;

      // Determine row styling based on state
      const getRowStyle = () => {
        if (isCompleted) {
          return hitTarget
            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
        }
        if (isActive) {
          return "bg-white dark:bg-gray-800 border-primary-500";
        }
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
      };

      // Determine input styling based on state
      const getInputStyle = () => {
        if (isCompleted) {
          return hitTarget
            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
        }
        if (isActive) {
          return "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-primary-300 dark:border-primary-600";
        }
        return "bg-gray-100 dark:bg-gray-800 text-gray-400";
      };

      return (
        <View
          className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${getRowStyle()}`}
        >
          {/* Set number badge */}
          <View className="flex-row items-center flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                isCompleted
                  ? hitTarget
                    ? "bg-primary-500"
                    : "bg-yellow-500"
                  : isActive
                    ? "bg-primary-100 dark:bg-primary-900/30"
                    : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`font-primaryBold text-sm ${
                  isCompleted
                    ? "text-white"
                    : isActive
                      ? "text-primary-600"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {setNumber}
              </Text>
            </View>

            {/* Target and previous performance */}
            <View className="flex-1">
              <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm">
                Target: {prescribedReps} reps
              </Text>
              {hasPreviousData && (
                <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                  Prev: {previousWeight} kg × {previousReps}
                </Text>
              )}
            </View>
          </View>

          {/* Reps input with auto-advance */}
          <View className="flex-row items-center">
            <AutoAdvanceNumberInput
              ref={ref}
              value={repsCompleted}
              onChange={onRepsChange}
              nextInputRef={nextInputRef}
              isLast={isLastSet}
              placeholder="—"
              placeholderTextColor="#9ca3af"
              className={`w-14 h-10 text-center rounded-lg font-primaryBold text-lg ${getInputStyle()}`}
            />
            <Text className="font-secondary text-gray-400 dark:text-gray-500 text-sm ml-2">
              reps
            </Text>
          </View>
        </View>
      );
    },
  ),
);
