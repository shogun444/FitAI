import { Button, Heading, Subheading } from "@/components";
import { InlineRestTimer } from "@/components/programs";
import { AddExerciseForm, ExerciseItem } from "@/components/workout";
import { useGlobalRestTimer } from "@/contexts/RestTimerContext";
import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { useWorkoutStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { currentWorkout, endWorkout, cancelWorkout } = useWorkoutStore();
  const { timer, openModal: openRestTimer } = useGlobalRestTimer();

  const { formattedTime } = useWorkoutTimer({
    startTime: currentWorkout?.startedAt ?? Date.now(),
    autoStart: !!currentWorkout,
  });

  // Check if timer is active (running or paused with time remaining)
  const isTimerActive = timer.hasStarted && timer.remaining > 0;

  const handleFinishWorkout = async () => {
    await endWorkout();
    router.replace("/workout/summary");
  };

  const handleCancelWorkout = () => {
    cancelWorkout();
    router.replace("/");
  };

  // Start rest timer with default duration
  const handleStartRest = () => {
    timer.reset(); // Reset to default duration
    timer.start();
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
        <View className="flex-row justify-between items-center mb-4">
          <Heading className="text-2xl">Workout</Heading>
          {/* Workout duration */}
          <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Subheading className="text-primary text-base">
              {formattedTime}
            </Subheading>
          </View>
        </View>

        {/* Inline Rest Timer - shown when timer is active */}
        {isTimerActive ? (
          <InlineRestTimer timer={timer} onExpand={openRestTimer} />
        ) : (
          /* Start Rest button - shown when timer is not active */
          <TouchableOpacity
            onPress={handleStartRest}
            className="flex-row items-center justify-center bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-3 mb-4"
          >
            <Ionicons name="timer-outline" size={20} color="#7c3aed" />
            <Text className="font-secondaryMedium text-primary-600 dark:text-primary-400 text-base ml-2">
              Start Rest Timer
            </Text>
          </TouchableOpacity>
        )}

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
