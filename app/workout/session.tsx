import { Button, Card, Heading, Subheading } from "@/components";
import { getExercises } from "@/lib/storage";
import { useWorkoutStore } from "@/store";
import { ExerciseTemplate } from "@/types";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Rest duration options from 30 seconds to 10 minutes
const REST_DURATION_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "1:00", value: 60 },
  { label: "1:30", value: 90 },
  { label: "2:00", value: 120 },
  { label: "2:30", value: 150 },
  { label: "3:00", value: 180 },
  { label: "4:00", value: 240 },
  { label: "5:00", value: 300 },
  { label: "7:00", value: 420 },
  { label: "10:00", value: 600 },
];

function RestTimer() {
  const { timer, startTimer, pauseTimer, resetTimer, setRestDuration } =
    useWorkoutStore();
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectDuration = (duration: number) => {
    setRestDuration(duration);
    setShowPicker(false);
  };

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          Rest Timer
        </Text>
        {!timer.isRunning && (
          <Pressable
            onPress={() => setShowPicker(!showPicker)}
            className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-lg"
          >
            <Text className="font-secondaryMedium text-sm text-gray-700 dark:text-gray-300">
              {formatTime(timer.duration)} ▼
            </Text>
          </Pressable>
        )}
      </View>

      {/* Duration Picker */}
      {showPicker && !timer.isRunning && (
        <View className="flex-row flex-wrap gap-2 mb-4">
          {REST_DURATION_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleSelectDuration(option.value)}
              className={`px-3 py-2 rounded-lg ${
                timer.duration === option.value
                  ? "bg-primary"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`font-secondaryMedium text-sm ${
                  timer.duration === option.value
                    ? "text-background-dark"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text className="font-primaryBold text-4xl text-primary text-center my-4">
        {formatTime(timer.remaining)}
      </Text>
      <View className="flex-row gap-2">
        {timer.isRunning ? (
          <Pressable
            onPress={pauseTimer}
            className="flex-1 bg-yellow-500 rounded-xl py-3"
          >
            <Text className="font-secondaryMedium text-white text-center">
              Pause
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => startTimer(timer.duration)}
            className="flex-1 bg-primary rounded-xl py-3"
          >
            <Text className="font-secondaryMedium text-background-dark text-center">
              Start
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={resetTimer}
          className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl py-3"
        >
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center">
            Reset
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

function AddExerciseForm({ autoOpen = false }: { autoOpen?: boolean }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);

  // Auto-open modal when starting a new workout (no exercises yet)
  useEffect(() => {
    if (autoOpen && !hasAutoOpened) {
      setModalVisible(true);
      setHasAutoOpened(true);
    }
  }, [autoOpen, hasAutoOpened]);

  useEffect(() => {
    if (modalVisible) {
      loadExercises();
    }
  }, [modalVisible]);

  const loadExercises = async () => {
    const data = await getExercises();
    setExercises(data);
  };

  const handleSelect = (exercise: ExerciseTemplate) => {
    addExercise(exercise.name);
    setModalVisible(false);
    setSearchQuery("");
  };

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Card className="mb-4">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
          Add Exercise
        </Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          className="bg-primary rounded-xl px-6 py-4"
        >
          <Text className="font-secondaryMedium text-background-dark text-center">
            Select Exercise
          </Text>
        </Pressable>
      </Card>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <Heading className="text-xl">Select Exercise</Heading>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text className="font-secondaryMedium text-primary text-base">
                Cancel
              </Text>
            </Pressable>
          </View>

          <View className="px-4 py-3">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
              placeholderTextColor="#9ca3af"
              className="font-secondary bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            />
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-4"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className="bg-surface dark:bg-surface-dark rounded-xl p-4 mb-2 active:opacity-80"
              >
                <Text className="font-primaryMedium text-gray-900 dark:text-white text-base">
                  {item.name}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="font-secondary text-gray-500">
                  No exercises found
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

function AddSetForm({ exerciseId }: { exerciseId: string }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const addSet = useWorkoutStore((s) => s.addSet);

  const handleAdd = () => {
    const r = parseInt(reps, 10);
    const w = parseFloat(weight);
    if (r > 0 && w >= 0) {
      addSet(exerciseId, r, w);
      setReps("");
      setWeight("");
    }
  };

  return (
    <View className="flex-row gap-2 mt-3">
      <TextInput
        value={reps}
        onChangeText={setReps}
        placeholder="Reps"
        keyboardType="number-pad"
        placeholderTextColor="#9ca3af"
        className="flex-1 font-secondary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-center"
      />
      <TextInput
        value={weight}
        onChangeText={setWeight}
        placeholder="Weight"
        keyboardType="decimal-pad"
        placeholderTextColor="#9ca3af"
        className="flex-1 font-secondary bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-center"
      />
      <Pressable
        onPress={handleAdd}
        className="bg-primary rounded-xl px-4 py-2"
      >
        <Text className="font-secondaryMedium text-background-dark">+</Text>
      </Pressable>
    </View>
  );
}

function ExerciseCard({ exercise }: { exercise: any }) {
  const { toggleSetCompleted, removeExercise } = useWorkoutStore();

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          {exercise.name}
        </Text>
        <Pressable onPress={() => removeExercise(exercise.id)}>
          <Text className="font-secondary text-red-500">Remove</Text>
        </Pressable>
      </View>

      {exercise.sets.length > 0 && (
        <View className="mb-2">
          <View className="flex-row mb-1">
            <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-sm">
              Set
            </Text>
            <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-sm">
              Reps
            </Text>
            <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-sm">
              Weight
            </Text>
            <Text className="w-16 font-secondaryMedium text-gray-500 text-center text-sm">
              Done
            </Text>
          </View>
          {exercise.sets.map((set: any, index: number) => (
            <Pressable
              key={set.id}
              onPress={() => toggleSetCompleted(exercise.id, set.id)}
              className={`flex-row py-2 rounded-lg ${
                set.completed ? "bg-primary/20" : ""
              }`}
            >
              <Text className="flex-1 font-secondary text-gray-900 dark:text-white text-center">
                {index + 1}
              </Text>
              <Text className="flex-1 font-secondary text-gray-900 dark:text-white text-center">
                {set.reps}
              </Text>
              <Text className="flex-1 font-secondary text-gray-900 dark:text-white text-center">
                {set.weight}
              </Text>
              <Text className="w-16 text-center">
                {set.completed ? "✓" : "○"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <AddSetForm exerciseId={exercise.id} />
    </Card>
  );
}

export default function WorkoutSessionScreen() {
  const { currentWorkout, endWorkout, cancelWorkout } = useWorkoutStore();

  if (!currentWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
        <Subheading>No active workout</Subheading>
      </SafeAreaView>
    );
  }

  const workoutDuration = Math.floor(
    (Date.now() - currentWorkout.startedAt) / 1000,
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Heading className="text-2xl">Workout</Heading>
          <Text className="font-secondaryMedium text-gray-500">
            {formatTime(workoutDuration)}
          </Text>
        </View>

        <RestTimer />
        <AddExerciseForm autoOpen={currentWorkout.exercises.length === 0} />

        {currentWorkout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}

        <View className="gap-3 mt-4 mb-8">
          <Button title="Finish Workout" onPress={endWorkout} />
          <Button
            title="Cancel Workout"
            variant="secondary"
            onPress={cancelWorkout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
