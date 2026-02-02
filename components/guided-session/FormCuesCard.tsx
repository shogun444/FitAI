import { Text, View } from "react-native";

interface FormCuesCardProps {
  /** Array of instruction strings */
  instructions: string[];
}

/**
 * Displays form cues/instructions for an exercise.
 *
 * Usage:
 * ```tsx
 * <FormCuesCard instructions={["Keep core tight", "Control the descent"]} />
 * ```
 */
export function FormCuesCard({ instructions }: FormCuesCardProps) {
  if (instructions.length === 0) {
    return null;
  }

  return (
    <View className="px-4 pb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
        Form Cues
      </Text>
      <View className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
        {instructions.map((instruction, index) => (
          <View key={index} className="flex-row mb-2 last:mb-0">
            <Text className="font-secondary text-primary mr-2">•</Text>
            <Text className="font-secondary text-gray-700 dark:text-gray-300 flex-1 leading-5">
              {instruction}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
