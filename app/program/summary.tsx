import { SessionSummaryCard } from "@/components/programs";
import { Button, Card, Heading, Subheading } from "@/components/ui";
import { LiftPerformance } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

/**
 * Program Session Summary Screen
 *
 * Shown after completing a program session.
 * Displays weight progressions with clear before/after comparisons.
 */
export default function ProgramSummaryScreen() {
  const params = useLocalSearchParams<{
    sessionNumber: string;
    performances: string;
  }>();

  const sessionNumber = parseInt(params.sessionNumber || "1", 10);

  // Parse performances from route params
  let performances: LiftPerformance[] = [];
  try {
    performances = params.performances ? JSON.parse(params.performances) : [];
  } catch {
    performances = [];
  }

  // Calculate totals
  const totalDelta = performances.reduce(
    (sum, p) => sum + (p.nextWeight - p.weight),
    0,
  );
  const liftsWithIncrease = performances.filter(
    (p) => p.nextWeight > p.weight,
  ).length;

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  // Edge case: No performance data
  if (performances.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-6">
        <Text className="font-secondary text-gray-500 dark:text-gray-400 text-center mb-4">
          Session data not found.
        </Text>
        <Button title="Return Home" onPress={handleContinue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Success indicator */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
            <Ionicons name="checkmark" size={32} color="#65a30d" />
          </View>
          <Heading className="text-center mb-1">Session Complete</Heading>
          <Subheading className="text-center">
            {totalDelta > 0
              ? `${liftsWithIncrease} lift${liftsWithIncrease !== 1 ? "s" : ""} progressed`
              : "Weights maintained for next session"}
          </Subheading>
        </View>

        {/* Session summary card */}
        <SessionSummaryCard
          performances={performances}
          sessionNumber={sessionNumber}
        />

        {/* Coach note */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <View className="flex-row">
            <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
              <Ionicons name="fitness" size={16} color="#6b7280" />
            </View>
            <View className="flex-1">
              <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-1">
                {totalDelta > 0 ? "Progress logged" : "Stay consistent"}
              </Text>
              <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs">
                {totalDelta > 0
                  ? "Your next session weights have been updated automatically."
                  : "Consistency builds strength. Your weights are ready for next session."}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <Button title="Done" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
