import { Button, Heading, Subheading } from "@/components";
import { EXERCISE_CATALOG } from "@/data/exercises";
import { useWorkoutStore } from "@/store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_EXERCISES_REQUIRED = 2;

export default function SelectExercisesScreen() {
  const router = useRouter();
  const { startWorkout, addExercise } = useWorkoutStore();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = EXERCISE_CATALOG.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length >= MIN_EXERCISES_REQUIRED) {
      // Start the workout
      startWorkout();

      // Add selected exercises to the workout
      selectedExercises.forEach((exerciseId) => {
        const exercise = EXERCISE_CATALOG.find((e) => e.id === exerciseId);
        if (exercise) {
          addExercise(exercise.name);
        }
      });

      // Navigate to workout session
      router.push("/workout/session");
    }
  };

  const isStartEnabled = selectedExercises.length >= MIN_EXERCISES_REQUIRED;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <Heading className="mb-2">Select Exercises</Heading>
        <Subheading className="mb-4">
          Choose at least {MIN_EXERCISES_REQUIRED} exercises to begin
        </Subheading>

        {/* Search Input */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
          placeholderTextColor="#9ca3af"
          className="font-secondary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white mb-4"
        />

        {/* Selected Count */}
        <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 mb-4">
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center">
            Selected: {selectedExercises.length}/{EXERCISE_CATALOG.length}
          </Text>
        </View>

        {/* Exercise List */}
        <View className="mb-6">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id);
            return (
              <Pressable
                key={exercise.id}
                onPress={() => toggleExercise(exercise.id, exercise.name)}
                className={`p-4 rounded-xl mb-2 border-2 ${
                  isSelected
                    ? "bg-primary/20 border-primary dark:bg-primary/30"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-primaryMedium text-base flex-1 ${
                      isSelected
                        ? "text-primary font-primarySemiBold"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {exercise.name}
                  </Text>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <Text className="text-white font-primaryBold">✓</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {filteredExercises.length === 0 && (
            <View className="items-center py-8">
              <Text className="font-secondary text-gray-500">
                No exercises found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Button at Bottom */}
      <View className="px-4 py-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <Button
          title={
            selectedExercises.length > 2
              ? "Ready to go!"
              : `Start Workout (${selectedExercises.length}/${MIN_EXERCISES_REQUIRED})`
          }
          onPress={handleStartWorkout}
          disabled={!isStartEnabled}
        />
      </View>
    </SafeAreaView>
  );
}
