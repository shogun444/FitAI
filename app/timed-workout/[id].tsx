import { Button, Card, Heading, Subheading } from "@/components";
import { formatDuration, getTimedWorkoutById } from "@/data/timed-workouts";
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

  // Count exercises and rest periods
  const exerciseCount = program.steps.filter(
    (s) => s.type === "exercise",
  ).length;
  const restCount = program.steps.filter((s) => s.type === "rest").length;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="items-center py-8">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="flame" size={40} color="#c9f158" />
          </View>
          <Heading className="text-center mb-2">{program.name}</Heading>
          <Subheading className="text-center">
            {formatDuration(program.totalDuration)} Follow-Along
          </Subheading>
        </View>

        {/* Description */}
        <Card className="mb-4">
          <Text className="font-secondary text-gray-600 dark:text-gray-400 leading-6">
            {program.description}
          </Text>
        </Card>

        {/* Stats */}
        <View className="flex-row mb-4">
          <Card className="flex-1 mr-2">
            <View className="items-center">
              <Text className="font-primaryBold text-2xl text-primary">
                {exerciseCount}
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">
                Exercises
              </Text>
            </View>
          </Card>
          <Card className="flex-1 ml-2">
            <View className="items-center">
              <Text className="font-primaryBold text-2xl text-amber-500">
                {restCount}
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">
                Rest Periods
              </Text>
            </View>
          </Card>
        </View>

        {/* Workout Structure */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Workout Structure
          </Text>
          {program.steps.map((step, index) => (
            <View
              key={index}
              className={`flex-row items-center py-3 ${
                index < program.steps.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  step.type === "rest"
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-primary-100 dark:bg-primary-900/30"
                }`}
              >
                <Text
                  className={`font-secondaryMedium text-sm ${
                    step.type === "rest" ? "text-amber-600" : "text-primary-600"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`font-secondaryMedium ${
                    step.type === "rest"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {step.name}
                </Text>
              </View>
              <Text className="font-secondary text-gray-500">
                {step.duration}s
              </Text>
            </View>
          ))}
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
            How It Works
          </Text>
          <View className="gap-2">
            <View className="flex-row items-start">
              <Ionicons
                name="play-circle"
                size={20}
                color="#65a30d"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text className="font-secondary text-gray-600 dark:text-gray-400 flex-1">
                Tap "Start Workout" and follow along with the timer
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons
                name="timer"
                size={20}
                color="#65a30d"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text className="font-secondary text-gray-600 dark:text-gray-400 flex-1">
                Each exercise auto-advances when the timer reaches zero
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons
                name="pause-circle"
                size={20}
                color="#f59e0b"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text className="font-secondary text-gray-600 dark:text-gray-400 flex-1">
                You can pause anytime if you need a break
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Start Button */}
      <View className="px-4 pb-6">
        <Button title="Start Workout" onPress={handleStartWorkout} />
      </View>
    </SafeAreaView>
  );
}
