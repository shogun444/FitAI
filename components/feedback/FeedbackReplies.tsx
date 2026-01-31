import { Reply } from "@/types";
import { Text, View } from "react-native";
import { ReplyItem } from "./ReplyItem";

interface FeedbackRepliesProps {
  replies: Reply[];
  currentUserId: string;
  onReplyUpvote: (replyId: string) => void;
}

/**
 * FeedbackReplies - displays all replies for a feedback item.
 *
 * Behavior:
 * - Renders replies in chronological order (oldest first)
 * - Shows count header when replies exist
 * - Empty state handled by parent (no replies = nothing rendered)
 */
export function FeedbackReplies({
  replies,
  currentUserId,
  onReplyUpvote,
}: FeedbackRepliesProps) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <Text className="font-secondaryMedium text-gray-500 dark:text-gray-400 text-xs mb-2">
        {replies.length} {replies.length === 1 ? "reply" : "replies"}
      </Text>
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          currentUserId={currentUserId}
          onUpvote={onReplyUpvote}
        />
      ))}
    </View>
  );
}
