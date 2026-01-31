import { Card } from "@/components/ui/Card";
import { Feedback, getUpvoteCount, hasUserUpvoted } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface FeedbackItemProps {
  feedback: Feedback;
  currentUserId: string;
  onUpvote: (id: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * FeedbackItem displays a single feedback entry with upvote toggle.
 *
 * UI Contract:
 * - isUpvoted: derived from feedback.upvotedBy.includes(currentUserId)
 * - upvoteCount: derived from feedback.upvotedBy.length
 * - Visual feedback: filled icon when upvoted, outline when not
 */
export function FeedbackItem({
  feedback,
  currentUserId,
  onUpvote,
}: FeedbackItemProps) {
  // Derive state from source of truth (upvotedBy array)
  const isUpvoted = hasUserUpvoted(feedback, currentUserId);
  const upvoteCount = getUpvoteCount(feedback);

  return (
    <Card className="mb-3">
      <Text className="font-secondary text-gray-900 dark:text-white text-base leading-relaxed mb-4">
        {feedback.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-secondary text-gray-400 text-xs">
          {formatDate(feedback.createdAt)}
        </Text>
        <Pressable
          onPress={() => onUpvote(feedback.id)}
          className={`flex-row items-center rounded-full px-3 py-2 ${
            isUpvoted
              ? "bg-primary/20 dark:bg-primary/30"
              : "bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          }`}
          accessibilityLabel={isUpvoted ? "Remove upvote" : "Upvote"}
          accessibilityRole="button"
        >
          <Ionicons
            name={isUpvoted ? "arrow-up" : "arrow-up-outline"}
            size={14}
            color="#c9f158"
          />
          <Text
            className={`font-secondaryMedium text-sm ml-1.5 ${
              isUpvoted ? "text-primary" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {upvoteCount}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
