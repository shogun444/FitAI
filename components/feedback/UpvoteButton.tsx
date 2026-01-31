import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

interface UpvoteButtonProps {
  isUpvoted: boolean;
  count: number;
  onPress: () => void;
  size?: "default" | "small";
}

/**
 * Reusable upvote button used by both Feedback and Reply items.
 *
 * UI Contract:
 * - isUpvoted: controls filled vs outline icon and background
 * - count: always derived from upvotedBy.length (never stored)
 * - size: "default" for feedback, "small" for replies
 */
export function UpvoteButton({
  isUpvoted,
  count,
  onPress,
  size = "default",
}: UpvoteButtonProps) {
  const isSmall = size === "small";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-full ${
        isSmall ? "px-2 py-1" : "px-3 py-2"
      } ${
        isUpvoted
          ? "bg-primary/20 dark:bg-primary/30"
          : "bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
      }`}
      accessibilityLabel={isUpvoted ? "Remove upvote" : "Upvote"}
      accessibilityRole="button"
    >
      <Ionicons
        name={isUpvoted ? "arrow-up" : "arrow-up-outline"}
        size={isSmall ? 12 : 14}
        color="#c9f158"
      />
      <Text
        className={`font-secondaryMedium ${isSmall ? "text-xs ml-1" : "text-sm ml-1.5"} ${
          isUpvoted ? "text-primary" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {count}
      </Text>
    </Pressable>
  );
}
