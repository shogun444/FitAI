import { Button, Card, Heading, Subheading } from "@/components";
import { useWorkoutStore } from "@/store";
import { Href, Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { currentWorkout, startWorkout, pastWorkouts, loadWorkouts } =
    useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleStartWorkout = () => {
    router.push("/workout/select-exercises" as Href);
  };

  const handleContinueWorkout = () => {
    router.push("/workout/session" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 p-6">
        <Heading className="text-4xl mb-2">fitAI</Heading>
        <Subheading className="text-lg mb-8">
          Your AI-powered fitness companion
        </Subheading>

        <View className="gap-4">
          {currentWorkout ? (
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Workout in Progress
              </Text>
              <Text className="font-secondary text-gray-500 mb-4">
                {currentWorkout.exercises.length} exercises added
              </Text>
              <Button
                title="Continue Workout"
                onPress={handleContinueWorkout}
              />
            </Card>
          ) : (
            <Button title="Start Workout" onPress={handleStartWorkout} />
          )}

          <Link href={"/workout/history" as Href} asChild>
            <Button title="View History" variant="secondary" />
          </Link>
        </View>

        {pastWorkouts.length > 0 && (
          <View className="mt-8">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
              Recent Workouts
            </Text>
            <Text className="font-secondary text-gray-500">
              {pastWorkouts.length} workout
              {pastWorkouts.length !== 1 ? "s" : ""} completed
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
