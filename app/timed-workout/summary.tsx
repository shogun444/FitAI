import { Button, Card, Heading, Subheading } from "@/components";
import { formatDuration, getTimedWorkoutById } from "@/data/timed-workouts";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Timed Workout Summary Screen
 *
 * Shown after completing a timed workout.
 * Displays completion message and workout stats.
 */
export default function TimedWorkoutSummaryScreen() {
  const router = useRouter();
  const { id, duration } = useLocalSearchParams<{
    id: string;
    duration: string;
  }>();

  const program = getTimedWorkoutById(id);
  const actualDuration = parseInt(duration || "0", 10);

  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>Workout not found</Subheading>
        <Button
          title="Go Home"
          variant="secondary"
          onPress={() => router.replace("/(tabs)/workout" as Href)}
          className="mt-4"
        />
      </SafeAreaView>
    );
  }

  // Count exercises completed
  const exerciseCount = program.steps.filter(
    (s) => s.type === "exercise",
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        {/* Celebration Header */}
        <View className="items-center py-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark" size={56} color="#000" />
          </View>
          <Heading className="text-center mb-2">Workout Complete!</Heading>
          <Subheading className="text-center">{program.name}</Subheading>
        </View>

        {/* Stats */}
        <View className="flex-row mb-6">
          <Card className="flex-1 mr-2">
            <View className="items-center">
              <Ionicons name="time" size={28} color="#65a30d" />
              <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white mt-2">
                {formatDuration(actualDuration || program.totalDuration)}
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">
                Duration
              </Text>
            </View>
          </Card>
          <Card className="flex-1 ml-2">
            <View className="items-center">
              <Ionicons name="fitness" size={28} color="#65a30d" />
              <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white mt-2">
                {exerciseCount}
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">
                Exercises
              </Text>
            </View>
          </Card>
        </View>

        {/* Exercises Completed */}
        <Card className="mb-6">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Exercises Completed
          </Text>
          {program.steps
            .filter((step) => step.type === "exercise")
            .map((step, index) => (
              <View
                key={index}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <View className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={14} color="#65a30d" />
                </View>
                <Text className="font-secondary text-gray-900 dark:text-white flex-1">
                  {step.name}
                </Text>
                <Text className="font-secondary text-gray-500">
                  {step.duration}s
                </Text>
              </View>
            ))}
        </Card>

        {/* Motivation */}
        <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-0">
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={24} color="#65a30d" />
            <View className="ml-3 flex-1">
              <Text className="font-primarySemiBold text-gray-900 dark:text-white">
                Great Work!
              </Text>
              <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm">
                Your core is getting stronger with every session.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Actions */}
      <View className="px-4 pb-6">
        <Button
          title="Done"
          onPress={() => router.replace("/(tabs)/workout" as Href)}
        />
      </View>
    </SafeAreaView>
  );
}
