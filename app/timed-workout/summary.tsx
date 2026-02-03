import {
  Button,
  Card,
  Heading,
  ScreenHeader,
  Subheading,
} from "@/components/ui";
import { formatDuration, getTimedWorkoutById } from "@/data/timed-workouts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Timed Workout Summary Screen
 *
 * Shown after completing a timed workout.
 * Uses same design pattern as pullup program summary.
 */
export default function TimedWorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    id: string;
    duration: string;
    exerciseData: string;
  }>();

  const program = getTimedWorkoutById(params.id);
  const actualDuration = parseInt(params.duration || "0", 10);

  // Parse exercise data from route params (same format as pullup program)
  interface ExerciseSummary {
    name: string;
    sets: { time?: number }[];
  }

  let exerciseSummaries: ExerciseSummary[] = [];
  try {
    exerciseSummaries = params.exerciseData
      ? JSON.parse(params.exerciseData)
      : [];
  } catch {
    exerciseSummaries = [];
  }

  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>Workout not found</Subheading>
        <Button
          title="Go Home"
          variant="secondary"
          onPress={() => router.replace("/(tabs)")}
          className="mt-4"
        />
      </SafeAreaView>
    );
  }

  // Calculate totals
  const totalExercises = exerciseSummaries.length;
  const totalTime = exerciseSummaries.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, s) => setSum + (s.time ?? 0), 0),
    0,
  );

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header - unified ScreenHeader component */}
      <ScreenHeader title={program.name} showBackButton={false} />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Success indicator */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
            <Ionicons name="checkmark" size={32} color="#65a30d" />
          </View>
          <Heading className="text-center mb-1">Workout Complete!</Heading>
        </View>

        {/* Stats row */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className="font-primaryBold text-3xl text-primary-600">
              {totalExercises}
            </Text>
            <Text className="font-secondary text-gray-500 text-sm">
              Exercises
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-primaryBold text-3xl text-primary-600">
              {totalTime}s
            </Text>
            <Text className="font-secondary text-gray-500 text-sm">
              Hold Time
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-primaryBold text-3xl text-primary-600">
              {formatDuration(actualDuration || program.totalDuration)}
            </Text>
            <Text className="font-secondary text-gray-500 text-sm">
              Duration
            </Text>
          </View>
        </View>

        {/* Exercise breakdown */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4">
            Exercises Completed
          </Text>

          {exerciseSummaries.map((ex, idx) => (
            <View
              key={idx}
              className={`py-3 ${
                idx < exerciseSummaries.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <Text className="font-secondaryMedium text-gray-800 dark:text-gray-200 mb-2">
                {ex.name}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ex.sets.map((set, setIdx) => (
                  <View
                    key={setIdx}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5"
                  >
                    <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm">
                      {set.time ?? 0}s
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Card>

        {/* Motivational note */}
        <Card className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <View className="flex-row">
            <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 items-center justify-center mr-3">
              <Ionicons name="fitness-outline" size={18} color="#65a30d" />
            </View>
            <View className="flex-1">
              <Text className="font-secondaryMedium text-primary-800 dark:text-primary-200 mb-1">
                Great work!
              </Text>
              <Text className="font-secondary text-primary-700 dark:text-primary-300 text-sm">
                Your core is getting stronger with every session. Keep it up!
              </Text>
            </View>
          </View>
        </Card>

        {/* Continue button */}
        <View className="mt-6">
          <Button title="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
