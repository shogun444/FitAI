import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Heading } from "./Heading";

interface ScreenHeaderProps {
  /**
   * The title to display in the header.
   * Should be the program name or screen title.
   */
  title: string;
  /**
   * Whether to show the back button. Defaults to true.
   */
  showBackButton?: boolean;
  /**
   * Custom back action. If not provided, uses router.back().
   */
  onBack?: () => void;
}

/**
 * Unified screen header component for all workout-related screens.
 *
 * Design source of truth: "Weighted Calisthenics Strength" program detail screen.
 *
 * Usage:
 * ```tsx
 * <ScreenHeader title="5 Min Killer Abs" />
 * <ScreenHeader title="Unlock Your First Pull-up" showBackButton={false} />
 * ```
 */
export function ScreenHeader({
  title,
  showBackButton = true,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center px-6 pt-4 pb-2">
      {showBackButton && (
        <Pressable
          onPress={handleBack}
          className="mr-4 p-1"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>
      )}
      <Heading className="text-2xl">{title}</Heading>
    </View>
  );
}
