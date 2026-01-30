import { Button, Heading, Subheading } from "@/components";
import { SessionSummary } from "@/components/workout";
import { useWorkoutStore } from "@/store";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { lastCompletedWorkout, pastWorkouts } = useWorkoutStore();

  const handleDone = () => {
    router.replace("/");
  };

  if (!lastCompletedWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>No workout to summarize</Subheading>
        <View className="mt-4 w-full">
          <Button title="Go Home" onPress={handleDone} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-2">Workout Complete! 🎉</Heading>
        <Subheading className="mb-8">Great job crushing that session</Subheading>

        <SessionSummary
          workout={lastCompletedWorkout}
          pastWorkouts={pastWorkouts}
        />

        <View className="mt-4 mb-8">
          <Button title="Done" onPress={handleDone} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
