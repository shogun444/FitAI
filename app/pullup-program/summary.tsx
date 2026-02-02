import { Button, Card, Heading, Subheading } from "@/components/ui";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Pull-up Program Session Summary Screen
 *
 * Shown after completing a program session.
 * Displays exercises completed with sets and reps/time.
 */
export default function PullupProgramSummaryScreen() {
  const params = useLocalSearchParams<{
    sessionNumber: string;
    exerciseData: string;
  }>();

  const sessionNumber = parseInt(params.sessionNumber || "1", 10);

  // Parse exercise data from route params
  interface ExerciseSummary {
    name: string;
    sets: { reps?: number; time?: number }[];
  }

  let exerciseSummaries: ExerciseSummary[] = [];
  try {
    exerciseSummaries = params.exerciseData
      ? JSON.parse(params.exerciseData)
      : [];
  } catch {
    exerciseSummaries = [];
  }

  // Calculate totals
  const totalSets = exerciseSummaries.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const totalReps = exerciseSummaries.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, s) => setSum + (s.reps ?? 0), 0),
    0,
  );
  const totalTime = exerciseSummaries.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, s) => setSum + (s.time ?? 0), 0),
    0,
  );

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Success indicator */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
            <Ionicons name="checkmark" size={32} color="#65a30d" />
          </View>
          <Heading className="text-center mb-1">Session Complete!</Heading>
          <Subheading className="text-center">
            Session {sessionNumber} of {PULLUP_PROGRAM.targetSessions}
          </Subheading>
        </View>

        {/* Stats row */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className="font-primaryBold text-3xl text-primary-600">
              {totalSets}
            </Text>
            <Text className="font-secondary text-gray-500 text-sm">Sets</Text>
          </View>
          {totalReps > 0 && (
            <View className="items-center">
              <Text className="font-primaryBold text-3xl text-primary-600">
                {totalReps}
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">Reps</Text>
            </View>
          )}
          {totalTime > 0 && (
            <View className="items-center">
              <Text className="font-primaryBold text-3xl text-primary-600">
                {totalTime}s
              </Text>
              <Text className="font-secondary text-gray-500 text-sm">
                Hold Time
              </Text>
            </View>
          )}
        </View>

        {/* Exercise breakdown */}
        <Card className="mb-4">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4">
            Exercises Completed
          </Text>

          {exerciseSummaries.map((ex, idx) => {
            const exerciseDef = PULLUP_PROGRAM_EXERCISES.find(
              (e) => e.name === ex.name,
            );
            const isTimeExercise = exerciseDef?.targetType === "time";

            return (
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
                        Set {setIdx + 1}:{" "}
                        {isTimeExercise
                          ? `${set.time ?? set.reps ?? 0}s`
                          : `${set.reps ?? 0} reps`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
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
                {sessionNumber < PULLUP_PROGRAM.targetSessions
                  ? `${PULLUP_PROGRAM.targetSessions - sessionNumber} sessions to go. You're building the strength for your first pull-up!`
                  : "You've completed the program! Time to test your pull-up."}
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
