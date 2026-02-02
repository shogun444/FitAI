import { Pressable, Text, View } from "react-native";

interface CompletedSet {
  setIndex: number;
  repsCompleted?: number;
  timeCompleted?: number;
}

interface CompletedSetsListProps {
  /** Array of completed sets */
  completedSets: CompletedSet[];
  /** Input type to determine unit display */
  inputType: "reps" | "time";
  /** Callback when a set is removed */
  onRemoveSet: (setIndex: number) => void;
}

/**
 * Displays a list of completed sets with remove functionality.
 * Matches the free workout tracker style with green checkmark badges.
 *
 * Usage:
 * ```tsx
 * <CompletedSetsList
 *   completedSets={completedSets}
 *   inputType="reps"
 *   onRemoveSet={handleRemoveSet}
 * />
 * ```
 */
export function CompletedSetsList({
  completedSets,
  inputType,
  onRemoveSet,
}: CompletedSetsListProps) {
  if (completedSets.length === 0) {
    return null;
  }

  const isTimeInput = inputType === "time";
  const unit = isTimeInput ? "seconds" : "reps";

  return (
    <View className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400">
          Completed Sets
        </Text>
      </View>
      {completedSets.map((set, index) => {
        const value = set.repsCompleted ?? set.timeCompleted ?? 0;
        return (
          <View
            key={index}
            className="flex-row items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            {/* Checkmark badge for completed set */}
            <View className="w-7 h-7 rounded-full bg-green-500 items-center justify-center mr-3">
              <Text className="text-white text-sm">✓</Text>
            </View>

            {/* Set label and value */}
            <View className="flex-1">
              <Text className="font-secondaryMedium text-gray-900 dark:text-white">
                Set {set.setIndex + 1}: {value} {unit}
              </Text>
            </View>

            {/* Remove button */}
            <Pressable
              onPress={() => onRemoveSet(set.setIndex)}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-red-400 text-sm">✕</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
