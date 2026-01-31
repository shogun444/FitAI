import {
  FeedbackFilter,
  FeedbackInput,
  FeedbackItem,
} from "@/components/feedback";
import { EmptyState, Heading } from "@/components/ui";
import {
  addFeedback,
  addReply,
  getFeedback,
  toggleFeedbackUpvote,
  toggleReplyUpvote,
} from "@/lib/storage";
import { getUserId, isUserIdInitialized } from "@/lib/user";
import {
  addReplyToFeedback,
  Feedback,
  FeedbackSortMode,
  getUpvoteCount,
  Reply,
  toggleReplyUpvote as toggleReplyUpvotePure,
  toggleUpvote,
} from "@/types";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sortMode, setSortMode] = useState<FeedbackSortMode>("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId (should already be initialized in _layout.tsx)
    if (isUserIdInitialized()) {
      setCurrentUserId(getUserId());
    }
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    const data = await getFeedback();
    setFeedbacks(data);
    setIsLoading(false);
  };

  const handleSubmit = async (content: string) => {
    const newFeedback = await addFeedback(content);
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };

  /**
   * Handle upvote toggle with optimistic UI.
   */
  const handleUpvote = async (id: string) => {
    if (!currentUserId) return;

    // Optimistic update
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? toggleUpvote(f, currentUserId) : f)),
    );

    try {
      await toggleFeedbackUpvote(id);
    } catch (error) {
      console.error("Failed to persist upvote:", error);
      const data = await getFeedback();
      setFeedbacks(data);
    }
  };

  /**
   * Handle adding a reply with optimistic UI.
   */
  const handleReply = async (feedbackId: string, content: string) => {
    if (!currentUserId) return;

    // Create optimistic reply
    const optimisticReply: Reply = {
      id: Crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      authorId: currentUserId,
      upvotedBy: [],
    };

    // Optimistic update
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === feedbackId ? addReplyToFeedback(f, optimisticReply) : f,
      ),
    );

    try {
      await addReply(feedbackId, content);
    } catch (error) {
      console.error("Failed to persist reply:", error);
      const data = await getFeedback();
      setFeedbacks(data);
    }
  };

  /**
   * Handle reply upvote toggle with optimistic UI.
   */
  const handleReplyUpvote = async (feedbackId: string, replyId: string) => {
    if (!currentUserId) return;

    // Optimistic update
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === feedbackId
          ? toggleReplyUpvotePure(f, replyId, currentUserId)
          : f,
      ),
    );

    try {
      await toggleReplyUpvote(feedbackId, replyId);
    } catch (error) {
      console.error("Failed to persist reply upvote:", error);
      const data = await getFeedback();
      setFeedbacks(data);
    }
  };

  const sortedFeedbacks = useCallback(() => {
    const sorted = [...feedbacks];
    switch (sortMode) {
      case "latest":
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case "oldest":
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case "upvotes":
        return sorted.sort((a, b) => getUpvoteCount(b) - getUpvoteCount(a));
      default:
        return sorted;
    }
  }, [feedbacks, sortMode]);

  // Don't render feedback items until userId is available
  if (!currentUserId) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="px-6 pt-6 pb-4">
          <Heading className="mb-6">Feedback</Heading>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-6 pt-6 pb-4">
        <Heading className="mb-6">Feedback</Heading>
        <FeedbackInput onSubmit={handleSubmit} />
        <FeedbackFilter activeMode={sortMode} onModeChange={setSortMode} />
      </View>

      <FlatList
        data={sortedFeedbacks()}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 pb-6"
        renderItem={({ item }) => (
          <FeedbackItem
            feedback={item}
            currentUserId={currentUserId}
            onUpvote={handleUpvote}
            onReply={handleReply}
            onReplyUpvote={handleReplyUpvote}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="chatbubble-outline"
              title="No feedback yet"
              description="Be the first to share your thoughts and help us improve!"
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
