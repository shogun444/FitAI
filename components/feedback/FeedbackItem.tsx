import { Card } from "@/components/ui/Card";
import { Feedback, getUpvoteCount, hasUserUpvoted } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FeedbackReplies } from "./FeedbackReplies";
import { ReplyInput } from "./ReplyInput";
import { UpvoteButton } from "./UpvoteButton";

interface FeedbackItemProps {
  feedback: Feedback;
  currentUserId: string;
  onUpvote: (id: string) => void;
  onReply: (feedbackId: string, content: string) => void;
  onReplyUpvote: (feedbackId: string, replyId: string) => void;
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
 * FeedbackItem displays a single feedback entry with upvote toggle and replies.
 *
 * UI Contract:
 * - isUpvoted: derived from feedback.upvotedBy.includes(currentUserId)
 * - upvoteCount: derived from feedback.upvotedBy.length
 * - Visual feedback: filled icon when upvoted, outline when not
 * - Reply button: ONLY on feedback items (not on replies)
 * - Reply input: hidden by default, shown when user taps Reply
 */
export const FeedbackItem = memo(function FeedbackItem({
  feedback,
  currentUserId,
  onUpvote,
  onReply,
  onReplyUpvote,
}: FeedbackItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  // Derive state from source of truth (upvotedBy array)
  const isUpvoted = hasUserUpvoted(feedback, currentUserId);
  const upvoteCount = getUpvoteCount(feedback);

  const handleReplySubmit = useCallback(
    (content: string) => {
      onReply(feedback.id, content);
      setShowReplyInput(false);
    },
    [feedback.id, onReply],
  );

  const handleReplyUpvote = useCallback(
    (replyId: string) => {
      onReplyUpvote(feedback.id, replyId);
    },
    [feedback.id, onReplyUpvote],
  );

  const handleUpvote = useCallback(() => {
    onUpvote(feedback.id);
  }, [feedback.id, onUpvote]);

  const toggleReplyInput = useCallback(() => {
    setShowReplyInput((prev) => !prev);
  }, []);

  const hideReplyInput = useCallback(() => {
    setShowReplyInput(false);
  }, []);

  return (
    <Card className="mb-3 ">
      <Text className="font-secondary text-gray-900 dark:text-white text-base leading-relaxed mb-4">
        {feedback.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-secondary text-gray-400 text-xs">
          {formatDate(feedback.createdAt)}
        </Text>
        <View className="flex-row items-center gap-2">
          {/* Reply button - ONLY on feedback, not on replies */}
          <Pressable
            onPress={toggleReplyInput}
            className="flex-row items-center rounded-full px-3 py-2 bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            accessibilityLabel="Reply"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
            {feedback.replies.length > 0 && (
              <Text className="font-secondaryMedium text-sm ml-1.5 text-gray-500 dark:text-gray-400">
                {feedback.replies.length}
              </Text>
            )}
          </Pressable>
          <UpvoteButton
            isUpvoted={isUpvoted}
            count={upvoteCount}
            onPress={handleUpvote}
          />
        </View>
      </View>

      {/* Reply input - hidden by default */}
      {showReplyInput && (
        <ReplyInput onSubmit={handleReplySubmit} onCancel={hideReplyInput} />
      )}

      {/* Replies section */}
      <FeedbackReplies
        replies={feedback.replies}
        currentUserId={currentUserId}
        onReplyUpvote={handleReplyUpvote}
      />
    </Card>
  );
});
