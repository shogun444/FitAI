import { Card, Heading } from "@/components";
import { addFeedback, getFeedback, upvoteFeedback } from "@/lib/storage";
import { Feedback, FeedbackSortMode } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// FeedbackFilter Component
// ============================================

interface FeedbackFilterProps {
  activeMode: FeedbackSortMode;
  onModeChange: (mode: FeedbackSortMode) => void;
}

function FeedbackFilter({ activeMode, onModeChange }: FeedbackFilterProps) {
  const modes: { key: FeedbackSortMode; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "oldest", label: "Oldest" },
    { key: "upvotes", label: "Top" },
  ];

  return (
    <View className="flex-row bg-gray-100 dark:bg-gray-900 rounded-lg p-1 mb-4">
      {modes.map((mode) => (
        <Pressable
          key={mode.key}
          onPress={() => onModeChange(mode.key)}
          className={`flex-1 py-2 rounded-md ${
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

// ============================================
// FeedbackInput Component
// ============================================

interface FeedbackInputProps {
  onSubmit: (content: string) => void;
}

function FeedbackInput({ onSubmit }: FeedbackInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setContent("");
  };

  return (
    <Card className="mb-4">
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Share your feedback..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="font-secondary bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px] mb-3"
      />
      <Pressable
        onPress={handleSubmit}
        disabled={content.trim().length === 0}
        className={`rounded-xl py-3 ${
          content.trim().length > 0
            ? "bg-primary"
            : "bg-gray-200 dark:bg-gray-800"
        }`}
      >
        <Text
          className={`font-secondaryMedium text-center ${
            content.trim().length > 0
              ? "text-background-dark"
              : "text-gray-400 dark:text-gray-600"
          }`}
        >
          Submit Feedback
        </Text>
      </Pressable>
    </Card>
  );
}

// ============================================
// FeedbackItem Component
// ============================================

interface FeedbackItemProps {
  feedback: Feedback;
  onUpvote: (id: string) => void;
}

function FeedbackItem({ feedback, onUpvote }: FeedbackItemProps) {
  const formatDate = (timestamp: number) => {
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
  };

  return (
    <Card className="mb-3">
      <Text className="font-secondary text-gray-900 dark:text-white text-base leading-relaxed mb-3">
        {feedback.content}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-secondary text-gray-400 text-xs">
          {formatDate(feedback.createdAt)}
        </Text>
        <Pressable
          onPress={() => onUpvote(feedback.id)}
          className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Ionicons name="arrow-up" size={14} color="#c9f158" />
          <Text className="font-secondaryMedium text-primary text-sm ml-1">
            {feedback.upvotes}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <View className="items-center py-12">
      <Ionicons name="chatbubble-outline" size={48} color="#6b7280" />
      <Text className="font-primaryMedium text-gray-500 text-lg mt-4">
        No feedback yet
      </Text>
      <Text className="font-secondary text-gray-400 text-sm mt-1 text-center px-8">
        Be the first to share your thoughts and help us improve!
      </Text>
    </View>
  );
}

// ============================================
// Main FeedbackScreen Component
// ============================================

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
      <FlatList
        data={sortedFeedbacks()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <Heading className="mb-4">Feedback</Heading>
            <FeedbackInput onSubmit={handleSubmit} />
            {feedbacks.length > 0 && (
              <FeedbackFilter
                activeMode={sortMode}
                onModeChange={setSortMode}
              />
            )}
          </>
        }
        renderItem={({ item }) => (
          <FeedbackItem feedback={item} onUpvote={handleUpvote} />
        )}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
      />
    </SafeAreaView>
  );
}
