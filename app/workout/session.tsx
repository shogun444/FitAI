import { Button, Heading, Subheading } from "@/components";
import {
  AddExerciseForm,
  ExerciseItem,
  RestTimer,
} from "@/components/workout";
import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { useWorkoutStore } from "@/store";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { currentWorkout, endWorkout, cancelWorkout } = useWorkoutStore();

  const { formattedTime } = useWorkoutTimer({
    startTime: currentWorkout?.startedAt ?? Date.now(),
    autoStart: !!currentWorkout,
  });

  const handleFinishWorkout = async () => {
    await endWorkout();
    router.replace("/workout/summary");
  };

  const handleCancelWorkout = () => {
    cancelWorkout();
    router.replace("/");
  };

  if (!currentWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>No active workout</Subheading>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Heading className="text-2xl">Workout</Heading>
          <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Subheading className="text-primary text-base">
              {formattedTime}
            </Subheading>
          </View>
        </View>

        {/* Rest Timer */}
        <RestTimer />

        {/* Add Exercise */}
        <AddExerciseForm />

        {/* Exercise List */}
        {currentWorkout.exercises.map((exercise) => (
          <ExerciseItem key={exercise.id} exercise={exercise} />
        ))}

        {/* Action Buttons */}
        <View className="gap-3 mt-6 mb-8">
          <Button title="Finish Workout" onPress={handleFinishWorkout} />
          <Button
            title="Cancel Workout"
            variant="secondary"
            onPress={handleCancelWorkout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
