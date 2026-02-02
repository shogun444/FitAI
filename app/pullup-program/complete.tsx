import { Button, Heading, Subheading } from "@/components";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import { usePullupProgram } from "@/hooks/usePullupProgram";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Program Completion Screen
 *
 * Celebrates the user for completing all sessions.
 * Provides options to:
 * - Go back to home
 * - Restart the program
 */
export default function PullupProgramCompleteScreen() {
  const router = useRouter();
  const { progress, resetProgram, targetSessions, completedSessionsCount } =
    usePullupProgram();

  const handleGoHome = () => {
    router.replace("/");
  };

  const handleRestartProgram = async () => {
    await resetProgram();
    router.replace("/pullup-program" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        {/* ============================================ */}
        {/* Celebration Header */}
        {/* ============================================ */}
        <View className="items-center py-8">
          <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-6">
            <Ionicons name="trophy" size={56} color="#000" />
          </View>

          <Heading className="text-center text-3xl mb-2">
            Congratulations! 🎉
          </Heading>

          <Subheading className="text-center mb-2">You've completed</Subheading>

          <Text className="font-primaryBold text-xl text-primary text-center">
            {PULLUP_PROGRAM.name}
          </Text>
        </View>

        {/* ============================================ */}
        {/* Stats Card */}
        {/* ============================================ */}
        <View className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="font-secondarySemiBold text-4xl text-gray-900 dark:text-white">
                {completedSessionsCount}
              </Text>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm">
                Sessions
              </Text>
            </View>

            <View className="w-px bg-gray-300 dark:bg-gray-700" />

            <View className="items-center">
              <Text className="font-secondarySemiBold text-4xl text-gray-900 dark:text-white">
                {PULLUP_PROGRAM_EXERCISES.length}
              </Text>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm">
                Exercises
              </Text>
            </View>

            <View className="w-px bg-gray-300 dark:bg-gray-700" />

            <View className="items-center">
              <Text className="font-secondarySemiBold text-4xl text-primary">
                ✓
              </Text>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm">
                Complete
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* Exercise Summary */}
        {/* ============================================ */}
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
          Your Training
        </Text>

        {PULLUP_PROGRAM_EXERCISES.map((exercise) => (
          <View
            key={exercise.id}
            className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl p-4 mb-2"
          >
            <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3">
              <Ionicons name="checkmark" size={24} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-primaryMedium text-gray-900 dark:text-white">
                {exercise.name}
              </Text>
              <Text className="font-secondary text-sm text-gray-500">
                {exercise.setsPerSession} sets per session
              </Text>
            </View>
          </View>
        ))}

        {/* ============================================ */}
        {/* What's Next */}
        {/* ============================================ */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mt-6 mb-6">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
            What's Next?
          </Text>
          <Text className="font-secondary text-gray-600 dark:text-gray-400 leading-6">
            You've built the foundation strength for your first pull-up through{" "}
            {completedSessionsCount} dedicated sessions. Now it's time to test
            yourself! Find a pull-up bar and give it your best shot.
          </Text>
          <Text className="font-secondary text-gray-600 dark:text-gray-400 leading-6 mt-3">
            If you're not quite there yet, don't worry. Restart the program and
            continue building strength. You'll get there!
          </Text>
        </View>

        {/* ============================================ */}
        {/* Action Buttons */}
        {/* ============================================ */}
        <Button title="Back to Home" onPress={handleGoHome} />

        <Button
          title="Restart Program"
          variant="secondary"
          onPress={handleRestartProgram}
          className="mt-3"
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
