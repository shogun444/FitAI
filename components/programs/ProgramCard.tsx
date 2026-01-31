import { Card } from "@/components/ui";
import { Program } from "@/data/programs";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
}

/**
 * Preview card for a program shown in explore/browse views.
 */
export function ProgramCard({ program, onPress }: ProgramCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="border border-primary/30">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            {program.isPaid && (
              <View className="bg-primary/20 dark:bg-primary/30 self-start px-2 py-0.5 rounded-full mb-2">
                <Text className="font-secondaryMedium text-primary-600 text-xs">
                  PAID
                </Text>
              </View>
            )}
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
              {program.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        <Text className="font-secondaryMedium text-primary-600 text-sm mb-2">
          {program.tagline}
        </Text>

        <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-3">
          {program.frequency} · {program.duration}
        </Text>

        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg self-start">
          <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-xs capitalize">
            {program.level}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
