import { Button, Card, ScreenHeader, Subheading } from "@/components";
import { ProgramHeader } from "@/components/programs";
import {
  getTimedWorkoutById,
  KILLER_ABS_5MIN_INFO,
} from "@/data/timed-workouts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Timed Workout Overview Screen
 *
 * Shows workout details and allows user to start the session.
 */
export default function TimedWorkoutOverviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const program = getTimedWorkoutById(id);

  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>Workout not found</Subheading>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
          className="mt-4"
        />
      </SafeAreaView>
    );
  }

  const handleStartWorkout = () => {
    router.push({
      pathname: "/timed-workout/session",
      params: { id: program.id },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header - unified ScreenHeader component */}
      <ScreenHeader title={program.name} />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
        {/* Program Header - same intro card as other programs */}
        <ProgramHeader program={KILLER_ABS_5MIN_INFO} />

        {/* How It Works */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1">
            How It Works
          </Text>
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-4">
            Follow along with the guided timer
          </Text>

          <View>
            <View className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="play-circle"
                  size={18}
                  color="#65a30d"
                  style={{ marginRight: 6 }}
                />
                <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                  Start & Follow
                </Text>
              </View>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Tap "Start Workout" and follow along with the timer. Each
                exercise will be displayed with a countdown.
              </Text>
            </View>
            <View className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="timer"
                  size={18}
                  color="#65a30d"
                  style={{ marginRight: 6 }}
                />
                <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                  Auto-Advance
                </Text>
              </View>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Each exercise auto-advances when the timer reaches zero. Just
                focus on the movement.
              </Text>
            </View>
            <View>
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="pause-circle"
                  size={18}
                  color="#f59e0b"
                  style={{ marginRight: 6 }}
                />
                <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                  Pause Anytime
                </Text>
              </View>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                You can pause anytime if you need a break. The timer will resume
                when you're ready.
              </Text>
            </View>
          </View>
        </Card>

        {/* Start Button */}
        <Button title="Start Workout" onPress={handleStartWorkout} />
      </ScrollView>
    </SafeAreaView>
  );
}
