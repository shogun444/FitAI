import { Button, ScreenHeader, Subheading } from "@/components";
import { SessionConflictModal } from "@/components/ui";
import { EXERCISE_CATALOG } from "@/data/exercises";
import { useSessionGuardWithConfirmation } from "@/hooks/useSessionGuardWithConfirmation";
import {
  CATEGORY_LABELS,
  filterExercises,
  getCategories,
  getTrainingTypes,
  TRAINING_TYPE_LABELS,
} from "@/lib/exerciseFilters";
import { useWorkoutStore } from "@/store";
import { ExerciseCategory, TrainingType } from "@/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_EXERCISES_REQUIRED = 2;

export default function SelectExercisesScreen() {
  const router = useRouter();
  const { startWorkout, addExercise } = useWorkoutStore();
  const { guardedStartWorkout, modalProps } = useSessionGuardWithConfirmation();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ExerciseCategory[]
  >([]);
  const [selectedTrainingType, setSelectedTrainingType] =
    useState<TrainingType | null>(null);

  const filteredExercises = filterExercises({
    categories: selectedCategories,
    trainingType: selectedTrainingType,
    searchQuery,
  });

  const toggleCategory = (category: ExerciseCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Remove if already selected
        return prev.filter((c) => c !== category);
      } else if (prev.length < 2) {
        // Add if under limit
        return [...prev, category];
      }
      // At limit, replace oldest with new
      return [prev[1], category];
    });
  };

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
      // Use guarded start to check for active sessions
      guardedStartWorkout(() => {
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
      });
    }
  };

  const isStartEnabled = selectedExercises.length >= MIN_EXERCISES_REQUIRED;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Session Conflict Modal */}
      <SessionConflictModal {...modalProps} />

      {/* Header - unified ScreenHeader component */}
      <ScreenHeader title="Start Workout" />

      <ScrollView className="flex-1 p-4">
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

        {/* Category Filter */}
        <View className="mb-3">
          <Text className="font-primaryMedium text-sm text-gray-600 dark:text-gray-400 mb-2">
            Category{" "}
            <Text className="font-secondary text-xs text-gray-400">
              (select up to 2)
            </Text>
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <Pressable
              onPress={() => setSelectedCategories([])}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategories.length === 0
                  ? "bg-primary"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`font-secondaryMedium text-sm ${
                  selectedCategories.length === 0
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                All
              </Text>
            </Pressable>
            {getCategories().map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    isSelected ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`font-secondaryMedium text-sm ${
                      isSelected
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Training Type Filter */}
        <View className="mb-4">
          <Text className="font-primaryMedium text-sm text-gray-600 dark:text-gray-400 mb-2">
            Training Style
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <Pressable
              onPress={() => setSelectedTrainingType(null)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedTrainingType === null
                  ? "bg-primary"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`font-secondaryMedium text-sm ${
                  selectedTrainingType === null
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                All
              </Text>
            </Pressable>
            {getTrainingTypes().map((type) => (
              <Pressable
                key={type}
                onPress={() =>
                  setSelectedTrainingType(
                    selectedTrainingType === type ? null : type,
                  )
                }
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedTrainingType === type
                    ? "bg-primary"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`font-secondaryMedium text-sm ${
                    selectedTrainingType === type
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {TRAINING_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Selected Count */}
        <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 mb-4">
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center">
            Selected: {selectedExercises.length}/{filteredExercises.length}
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
                  <View className="flex-1">
                    <Text
                      className={`font-primaryMedium text-base ${
                        isSelected
                          ? "text-primary font-primarySemiBold"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {exercise.name}
                    </Text>
                    <View className="flex-row mt-1 gap-2">
                      <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {exercise.category}
                      </Text>
                      <Text className="font-secondary text-xs text-gray-400 dark:text-gray-500">
                        •
                      </Text>
                      <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400">
                        {exercise.trainingTypes
                          .map((t) => TRAINING_TYPE_LABELS[t])
                          .join(", ")}
                      </Text>
                    </View>
                  </View>
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
