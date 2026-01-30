import { Button, Card, Heading, Subheading } from "@/components";
import { useWorkoutStore } from "@/store";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutTabScreen() {
  const router = useRouter();
  const { currentWorkout, startWorkout } = useWorkoutStore();

  const handleStartWorkout = () => {
    startWorkout();
    router.push("/workout/session" as Href);
  };

  const handleContinueWorkout = () => {
    router.push("/workout/session" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-2">Workout</Heading>
        <Subheading className="mb-8">Track your fitness journey</Subheading>

        {currentWorkout ? (
          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Workout in Progress
            </Text>
            <Text className="font-secondary text-gray-500 mb-1">
              {currentWorkout.exercises.length} exercise
              {currentWorkout.exercises.length !== 1 ? "s" : ""} added
            </Text>
            <Text className="font-secondary text-gray-500 mb-4">
              {currentWorkout.exercises.reduce(
                (acc, ex) => acc + ex.sets.length,
                0,
              )}{" "}
              total sets
            </Text>
            <Button title="Continue Workout" onPress={handleContinueWorkout} />
          </Card>
        ) : (
          <Card className="mb-4">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Ready to train?
            </Text>
            <Text className="font-secondary text-gray-500 mb-4">
              Start a new workout session and track your exercises, sets, and
              rest periods.
            </Text>
            <Button title="Start New Workout" onPress={handleStartWorkout} />
          </Card>
        )}

        <Pressable
          onPress={() => router.push("/workout/history" as Href)}
          className="mt-2"
        >
          <Card>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
                  Workout History
                </Text>
                <Text className="font-secondary text-gray-500">
                  View your past workouts
                </Text>
              </View>
              <Text className="text-2xl text-gray-400">→</Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
