import { ProgramAdviceSection, ProgramHeader } from "@/components/programs";
import { Button, ScreenHeader } from "@/components/ui";
import { getProgramById } from "@/data/programs";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Program Detail Screen
 *
 * Displays program information and training advice.
 * Screens orchestrate state; components render UI.
 */
export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasActiveProgram } = useProgramInstance();

  const program = getProgramById(id);

  // Handle program not found
  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
            Program not found
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleStartProgram = () => {
    router.push(`/program/calibrate?id=${program.id}` as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header - using unified ScreenHeader component */}
      <ScreenHeader title={program.name} />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
        {/* Program Header */}
        <ProgramHeader program={program} />

        {/* Training Advice Section */}
        <ProgramAdviceSection advice={program.advice} />

        {/* Start Program CTA */}
        {hasActiveProgram ? (
          <View className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="font-secondary text-center text-gray-600 dark:text-gray-400">
              You already have an active program. Complete or abandon it first.
            </Text>
          </View>
        ) : (
          <Button
            title="Start Program"
            onPress={handleStartProgram}
            className="mt-2"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
