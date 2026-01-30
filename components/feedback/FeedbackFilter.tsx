import { FeedbackSortMode } from "@/types";
import { Pressable, Text, View } from "react-native";

interface FeedbackFilterProps {
  activeMode: FeedbackSortMode;
  onModeChange: (mode: FeedbackSortMode) => void;
}

const FILTER_MODES: { key: FeedbackSortMode; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "oldest", label: "Oldest" },
  { key: "upvotes", label: "Top" },
];

export function FeedbackFilter({
  activeMode,
  onModeChange,
}: FeedbackFilterProps) {
  return (
    <View className="flex-row bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-4">
      {FILTER_MODES.map((mode) => (
        <Pressable
          key={mode.key}
          onPress={() => onModeChange(mode.key)}
          className={`flex-1 py-2.5 rounded-lg ${
            activeMode === mode.key
              ? "bg-white dark:bg-gray-800"
              : "bg-transparent"
          }`}
        >
          <Text
            className={`font-secondaryMedium text-center text-sm ${
              activeMode === mode.key
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {mode.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
