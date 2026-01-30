import {
  FeedbackFilter,
  FeedbackInput,
  FeedbackItem,
} from "@/components/feedback";
import { EmptyState, Heading } from "@/components/ui";
import { addFeedback, getFeedback, upvoteFeedback } from "@/lib/storage";
import { Feedback, FeedbackSortMode } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sortMode, setSortMode] = useState<FeedbackSortMode>("latest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const handleUpvote = async (id: string) => {
    await upvoteFeedback(id);
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f)),
    );
  };

  const sortedFeedbacks = useCallback(() => {
    const sorted = [...feedbacks];
    switch (sortMode) {
      case "latest":
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case "oldest":
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case "upvotes":
        return sorted.sort((a, b) => b.upvotes - a.upvotes);
      default:
        return sorted;
    }
  }, [feedbacks, sortMode]);

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
          <FeedbackItem feedback={item} onUpvote={handleUpvote} />
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
