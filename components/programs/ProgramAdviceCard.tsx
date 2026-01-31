import { ProgramAdvice } from "@/data/programs";
import { Text, View } from "react-native";

interface ProgramAdviceCardProps {
  advice: ProgramAdvice;
}

/**
 * Displays a single piece of training advice.
 * Static, educational content—not tracked or enforced.
 */
export function ProgramAdviceCard({ advice }: ProgramAdviceCardProps) {
  return (
    <View className="mb-4">
      <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white mb-1">
        {advice.title}
      </Text>
      <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {advice.content}
      </Text>
    </View>
  );
}
