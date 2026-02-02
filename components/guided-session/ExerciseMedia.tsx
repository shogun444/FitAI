import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface ExerciseMediaProps {
  /** Optional media URL (image/gif path) */
  media?: string;
}

/**
 * Exercise media placeholder/display.
 * Shows video placeholder when no media is available.
 *
 * Usage:
 * ```tsx
 * <ExerciseMedia media={exercise.media} />
 * ```
 */
export function ExerciseMedia({ media }: ExerciseMediaProps) {
  return (
    <View className="px-4 py-4">
      <View className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-video items-center justify-center">
        {media ? (
          // TODO: Replace with actual GIF/Image component
          <Text className="font-secondary text-gray-500">[Exercise Media]</Text>
        ) : (
          <View className="items-center">
            <Ionicons name="videocam-outline" size={48} color="#9ca3af" />
            <Text className="font-secondary text-gray-400 mt-2">
              Video coming soon
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
