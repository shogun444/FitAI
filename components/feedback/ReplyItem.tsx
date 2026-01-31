import { getUpvoteCount, hasUserUpvoted, Reply } from "@/types";
import { Text, View } from "react-native";
import { UpvoteButton } from "./UpvoteButton";

interface ReplyItemProps {
  reply: Reply;
  currentUserId: string;
  onUpvote: (replyId: string) => void;
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
 * ReplyItem displays a single reply with upvote toggle.
 *
 * STRICT CONSTRAINT: No reply button on replies.
 * Replies are ONE LEVEL DEEP only - this component enforces that by design.
 *
 * Visual hierarchy:
 * - Indented from parent feedback
 * - Smaller text
 * - Gray left border for visual grouping
 */
export function ReplyItem({ reply, currentUserId, onUpvote }: ReplyItemProps) {
  // Derive state from source of truth (upvotedBy array)
  const isUpvoted = hasUserUpvoted(reply, currentUserId);
  const upvoteCount = getUpvoteCount(reply);

  return (
    <View className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-gray-700 py-2">
      <Text className="font-secondary text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">
        {reply.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-secondary text-gray-400 text-xs">
          {formatDate(reply.createdAt)}
        </Text>
        <UpvoteButton
          isUpvoted={isUpvoted}
          count={upvoteCount}
          onPress={() => onUpvote(reply.id)}
          size="small"
        />
      </View>
    </View>
  );
}
