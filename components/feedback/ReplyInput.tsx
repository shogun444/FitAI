import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface ReplyInputProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

/**
 * ReplyInput - inline input for adding a reply to feedback.
 *
 * Behavior:
 * - Shown only when user taps "Reply" on a feedback item
 * - Hidden by default
 * - Cancel button to dismiss without submitting
 * - Submit clears input and triggers callback
 */
export function ReplyInput({ onSubmit, onCancel }: ReplyInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setContent("");
  };

  const isValid = content.trim().length > 0;

  return (
    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Write a reply..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        autoFocus
        className="font-secondary bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm min-h-[60px] mb-2"
      />
      <View className="flex-row justify-end gap-2">
        <Pressable
          onPress={onCancel}
          className="px-4 py-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
        >
          <Text className="font-secondaryMedium text-gray-500 dark:text-gray-400 text-sm">
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          className={`px-4 py-2 rounded-lg ${
            isValid ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
          }`}
        >
          <Text
            className={`font-secondaryMedium text-sm ${
              isValid
                ? "text-background-dark"
                : "text-gray-400 dark:text-gray-600"
            }`}
          >
            Reply
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
