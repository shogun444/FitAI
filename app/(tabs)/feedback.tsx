import {
  FeedbackFilter,
  FeedbackInput,
  FeedbackItem,
} from "@/components/feedback";
import { EmptyState, Heading } from "@/components/ui";
import { addFeedback, getFeedback, toggleFeedbackUpvote } from "@/lib/storage";
import { getUserId, isUserIdInitialized } from "@/lib/user";
import {
  Feedback,
  FeedbackSortMode,
  getUpvoteCount,
  toggleUpvote,
} from "@/types";
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
   *
   * Strategy:
   * 1. Optimistically update UI immediately (fast UX)
   * 2. Persist to storage in background
   * 3. On error, revert to previous state
   *
   * Handles rapid tapping: each tap creates consistent toggle
   */
  const handleUpvote = async (id: string) => {
    if (!currentUserId) return;

    // Optimistic update: apply toggle immediately to UI
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? toggleUpvote(f, currentUserId) : f)),
    );

    // Persist to storage (mutex-locked for consistency)
    try {
      await toggleFeedbackUpvote(id);
    } catch (error) {
      // Revert on failure by reloading from storage
      console.error("Failed to persist upvote:", error);
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
        // Sort by upvotedBy.length (derived count)
        return sorted.sort(
          (a, b) => getUpvoteCount(b) - getUpvoteCount(a),
        );
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
