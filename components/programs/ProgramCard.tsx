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
      <Card className="border border-primary/30 p-5">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            {program.isPaid && (
              <View className="bg-primary/20 dark:bg-primary/30 self-start px-2.5 py-1 rounded-full mb-2.5">
                <Text className="font-primaryMedium text-primary-600 text-[10px] tracking-wide">
                  PAID
                </Text>
              </View>
            )}
            <Text className="font-primarySemiBold text-xl text-gray-900 dark:text-white tracking-tight leading-7">
              {program.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        <Text className="font-primaryMedium text-primary-600 text-sm mb-3 leading-5">
          {program.tagline}
        </Text>

        <Text className="font-primary text-gray-400 dark:text-gray-500 text-xs mb-4 tracking-wide">
          {program.frequency} · {program.duration}
        </Text>

        <View className="bg-gray-100 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg self-start">
          <Text className="font-primaryMedium text-gray-500 dark:text-gray-400 text-[11px] capitalize tracking-wide">
            {program.level}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
