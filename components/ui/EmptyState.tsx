import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center py-16">
      <Ionicons name={icon} size={48} color="#6b7280" />
      <Text className="font-primaryMedium text-gray-500 text-lg mt-4">
        {title}
      </Text>
      <Text className="font-secondary text-gray-400 text-sm mt-1.5 text-center px-8">
        {description}
      </Text>
    </View>
  );
}
