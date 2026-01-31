import { Card } from "@/components/ui";
import { Program } from "@/data/programs";
import { Text, View } from "react-native";

interface ProgramHeaderProps {
  program: Program;
}

/**
 * Displays program header with name, tagline, and key details.
 */
export function ProgramHeader({ program }: ProgramHeaderProps) {
  return (
    <Card className="mb-4">
      {/* Paid Badge */}
      {program.isPaid && (
        <View className="bg-primary/20 dark:bg-primary/30 self-start px-3 py-1 rounded-full mb-3">
          <Text className="font-secondaryMedium text-primary-600 text-xs">
            PAID PROGRAM
          </Text>
        </View>
      )}

      {/* Title & Tagline */}
      <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white mb-1">
        {program.name}
      </Text>
      <Text className="font-secondaryMedium text-primary text-base mb-4">
        {program.tagline}
      </Text>

      {/* Description */}
      <Text className="font-secondary text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-5">
        {program.description}
      </Text>

      {/* Key Details */}
      <View className="flex-row flex-wrap gap-3">
        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs mb-0.5">
            Frequency
          </Text>
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-sm">
            {program.frequency}
          </Text>
        </View>

        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs mb-0.5">
            Duration
          </Text>
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-sm">
            {program.duration}
          </Text>
        </View>

        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs mb-0.5">
            Level
          </Text>
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-sm capitalize">
            {program.level}
          </Text>
        </View>
      </View>
    </Card>
  );
}
