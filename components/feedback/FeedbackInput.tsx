import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

interface FeedbackInputProps {
  onSubmit: (content: string) => void;
}

export function FeedbackInput({ onSubmit }: FeedbackInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setContent("");
  };

  const isValid = content.trim().length > 0;

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
        disabled={!isValid}
        className={`rounded-xl py-3.5 ${
          isValid ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
        }`}
      >
        <Text
          className={`font-secondaryMedium text-center ${
            isValid
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
