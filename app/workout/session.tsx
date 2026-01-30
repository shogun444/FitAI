import { Button, Card, Heading, Subheading } from "@/components";
import { getExercises } from "@/lib/storage";
import { useWorkoutStore } from "@/store";
import { ExerciseTemplate } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

// ============================================
// Section 1: RestTimePicker Component
// ============================================

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const MIN_REST_SECONDS = 30;
const MAX_REST_SECONDS = 600;

interface TimeWheelProps {
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
}

// ============================================
// Section 2: Time Wheel Implementation
// ============================================

function TimeWheel({ values, selectedValue, onValueChange }: TimeWheelProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const isProgrammaticScroll = useRef(false);

  const initialIndex = values.indexOf(selectedValue);

  useEffect(() => {
    // Scroll to selected value when it changes externally (not from user scroll)
    if (!isUserScrolling.current && scrollViewRef.current) {
      const index = values.indexOf(selectedValue);
      if (index >= 0) {
        isProgrammaticScroll.current = true;
        scrollViewRef.current.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
        // Clear flag after scroll completes
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 300);
      }
    }
  }, [selectedValue, values]);

  const snapToNearestItem = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

      // Snap the scroll position
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: clampedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }

      // Always update the value from scroll position
      const newValue = values[clampedIndex];
      onValueChange(newValue);

      isUserScrolling.current = false;
    },
    [values, onValueChange],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Ignore scroll end events triggered by programmatic scrolls
      if (isProgrammaticScroll.current) {
        isUserScrolling.current = false;
        return;
      }
      const offsetY = event.nativeEvent.contentOffset.y;
      snapToNearestItem(offsetY);
    },
    [snapToNearestItem],
  );

  const handleScrollBegin = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  return (
    <View
      className="overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      {/* Selection indicator */}
      <View
        className="absolute left-0 right-0 border-t-2 border-b-2 border-primary z-10"
        style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled={true}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT,
          paddingBottom: ITEM_HEIGHT,
        }}
        contentOffset={{
          x: 0,
          y: initialIndex >= 0 ? initialIndex * ITEM_HEIGHT : 0,
        }}
      >
        {values.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <View
              key={item}
              className="items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            >
              <Text
                className={`font-primaryBold text-3xl ${
                  isSelected
                    ? "text-primary"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                {item.toString().padStart(2, "0")}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================
// Section 3: Validation Logic
// ============================================

function validateRestTime(minutes: number, seconds: number): number {
  let totalSeconds = minutes * 60 + seconds;

  // Enforce minimum
  if (totalSeconds < MIN_REST_SECONDS) {
    totalSeconds = MIN_REST_SECONDS;
  }

  // Enforce maximum
  if (totalSeconds > MAX_REST_SECONDS) {
    totalSeconds = MAX_REST_SECONDS;
  }

  return totalSeconds;
}

// ============================================
// Section 4: RestTimePicker with Large Display
// ============================================

interface RestTimePickerProps {
  duration: number;
  onDurationChange: (seconds: number) => void;
  onTogglePicker?: () => void;
}

const MINUTES_VALUES = Array.from({ length: 11 }, (_, i) => i); // 0-10
const SECONDS_VALUES = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ... 55

function RestTimePicker({
  duration,
  onDurationChange,
  onTogglePicker,
}: RestTimePickerProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Round seconds to nearest 5 for the picker
  const roundedSeconds = Math.round(seconds / 5) * 5;

  const handleMinutesChange = (newMinutes: number) => {
    // When minutes = 10, force seconds to 0 (max is 10:00)
    const effectiveSeconds = newMinutes >= 10 ? 0 : roundedSeconds;
    const validated = validateRestTime(newMinutes, effectiveSeconds);
    onDurationChange(validated);
  };

  const handleSecondsChange = (newSeconds: number) => {
    // When minutes = 10, ignore seconds changes (max is 10:00)
    if (minutes >= 10) {
      return;
    }
    const validated = validateRestTime(minutes, newSeconds);
    onDurationChange(validated);
  };

  return (
    <View className="items-center">
      {/* Large Timer Display */}
      <Pressable onPress={onTogglePicker}>
        <View className="flex-row items-center justify-center mb-4">
          <Text className="font-primaryBold text-6xl text-primary">
            {minutes.toString().padStart(2, "0")}
          </Text>
          <Text className="font-primaryBold text-6xl text-primary mx-2">:</Text>
          <Text className="font-primaryBold text-6xl text-primary">
            {roundedSeconds.toString().padStart(2, "0")}
          </Text>
        </View>
      </Pressable>

      {/* Picker Wheels */}
      <View className="flex-row items-center">
        <View className="items-center">
          <Text className="font-secondaryMedium text-xs text-gray-500 mb-1">
            MIN
          </Text>
          <View className="w-20">
            <TimeWheel
              values={MINUTES_VALUES}
              selectedValue={minutes}
              onValueChange={handleMinutesChange}
            />
          </View>
        </View>

        <Text className="font-primaryBold text-2xl text-gray-400 mx-4">:</Text>

        <View className="items-center">
          <Text className="font-secondaryMedium text-xs text-gray-500 mb-1">
            SEC
          </Text>
          <View className="w-20">
            <TimeWheel
              values={SECONDS_VALUES}
              selectedValue={roundedSeconds}
              onValueChange={handleSecondsChange}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function RestTimer() {
  const { timer, startTimer, pauseTimer, resetTimer, setRestDuration } =
    useWorkoutStore();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          Rest Timer
        </Text>
        {!timer.isRunning && (
          <Pressable
            onPress={() => setShowPicker((prev) => !prev)}
            className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-lg"
          >
            <Text className="font-secondaryMedium text-sm text-gray-700 dark:text-gray-300">
              {formatTime(timer.duration)} {showPicker ? "▲" : "▼"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Duration Picker */}
      {showPicker && !timer.isRunning && (
        <View className="py-4">
          <RestTimePicker
            duration={timer.duration}
            onDurationChange={setRestDuration}
            onTogglePicker={() => setShowPicker(false)}
          />
        </View>
      )}

      {/* Timer Display when running or idle without picker */}
      {!showPicker && (
        <Pressable
          onPress={() => !timer.isRunning && setShowPicker(true)}
          disabled={timer.isRunning}
        >
          <Text className="font-primaryBold text-5xl text-primary text-center my-4">
            {formatTime(timer.remaining)}
          </Text>
        </Pressable>
      )}

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
            onPress={() => {
              setShowPicker(false);
              startTimer(timer.duration);
            }}
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

function SetRow({
  exerciseId,
  set,
  index,
  onFocus,
}: {
  exerciseId: string;
  set: any;
  index: number;
  onFocus?: () => void;
}) {
  const { updateSet, toggleSetCompleted, removeSet } = useWorkoutStore();
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const handleRepsChange = (value: string) => {
    setReps(value);
    const parsed = value === "" ? null : parseInt(value, 10);
    if (parsed === null || !isNaN(parsed)) {
      updateSet(exerciseId, set.id, parsed, set.weight);
    }
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed === null || !isNaN(parsed)) {
      updateSet(exerciseId, set.id, set.reps, parsed);
    }
  };

  const handleComplete = () => {
    // Only allow completion if reps and weight are filled
    if (set.reps !== null && set.weight !== null) {
      toggleSetCompleted(exerciseId, set.id);
    }
  };

  const handleFocus = () => {
    // If this set was completed, uncomplete it when editing
    if (set.completed) {
      toggleSetCompleted(exerciseId, set.id);
    }
    setIsEditing(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleRemove = () => {
    removeSet(exerciseId, set.id);
  };

  const isReadyToComplete = set.reps !== null && set.weight !== null;
  const showGreenBackground = set.completed && !isEditing;

  return (
    <View
      className={`flex-row items-center py-2 rounded-lg ${
        showGreenBackground ? "bg-primary/20" : ""
      }`}
    >
      <Text className="w-10 font-secondary text-gray-900 dark:text-white text-center">
        {index + 1}
      </Text>
      <TextInput
        value={reps}
        onChangeText={handleRepsChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="—"
        keyboardType="number-pad"
        placeholderTextColor="#9ca3af"
        className={`flex-1 font-secondary text-center py-1 mx-1 rounded-lg ${
          showGreenBackground
            ? "text-gray-900 dark:text-white bg-transparent"
            : "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
        }`}
      />
      <TextInput
        value={weight}
        onChangeText={handleWeightChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="—"
        keyboardType="decimal-pad"
        placeholderTextColor="#9ca3af"
        className={`flex-1 font-secondary text-center py-1 mx-1 rounded-lg ${
          showGreenBackground
            ? "text-gray-900 dark:text-white bg-transparent"
            : "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
        }`}
      />
      <Pressable
        onPress={handleComplete}
        disabled={!isReadyToComplete && !set.completed}
        className="w-10 items-center"
      >
        <Text
          className={`text-lg ${
            set.completed
              ? "text-green-600"
              : isReadyToComplete
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-300 dark:text-gray-700"
          }`}
        >
          {set.completed ? "✓" : "○"}
        </Text>
      </Pressable>
      <Pressable onPress={handleRemove} className="w-8 items-center">
        <Text className="text-red-500 text-sm">✕</Text>
      </Pressable>
    </View>
  );
}

function LastSessionSummary({ exerciseName }: { exerciseName: string }) {
  const { getLastSessionForExercise } = useWorkoutStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const lastSession = getLastSessionForExercise(exerciseName);

  if (!lastSession) {
    return null; // Don't show anything if no previous session exists
  }

  // Only count completed sets as working sets
  const workingSets = lastSession.sets.filter((set) => set.completed);

  if (workingSets.length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={() => setIsExpanded(!isExpanded)}
      className="mb-3 border-t border-gray-200 dark:border-gray-700 pt-2"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-secondaryMedium text-xs text-gray-500 uppercase tracking-wide">
          Last Session ({workingSets.length} sets)
        </Text>
        <Text className="font-secondary text-gray-400 text-xs">
          {isExpanded ? "▼" : "▶"}
        </Text>
      </View>

      {isExpanded && (
        <View className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
          {workingSets.map((set, index) => (
            <View key={set.id} className="flex-row py-1">
              <Text className="flex-1 font-secondary text-xs text-gray-600 dark:text-gray-400">
                Set {index + 1}
              </Text>
              <Text className="flex-1 font-secondaryMedium text-xs text-gray-700 dark:text-gray-300 text-right">
                {set.reps ?? 0} reps × {set.weight ?? 0} kg
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

function ExerciseCard({ exercise }: { exercise: any }) {
  const { removeExercise, addSet, toggleSetCompleted } = useWorkoutStore();

  // Auto-complete the previous set when focusing on a new set
  const handleSetFocus = (currentIndex: number) => {
    if (currentIndex > 0) {
      const previousSet = exercise.sets[currentIndex - 1];
      // Only auto-complete if the previous set has reps and weight and is not already completed
      if (
        previousSet &&
        !previousSet.completed &&
        previousSet.reps !== null &&
        previousSet.weight !== null
      ) {
        toggleSetCompleted(exercise.id, previousSet.id);
      }
    }
  };

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

      <LastSessionSummary exerciseName={exercise.name} />

      {/* Sets Table Header */}
      <View className="flex-row mb-1 mt-2">
        <Text className="w-10 font-secondaryMedium text-gray-500 text-center text-sm">
          Set
        </Text>
        <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-sm">
          Reps
        </Text>
        <Text className="flex-1 font-secondaryMedium text-gray-500 text-center text-sm">
          kg
        </Text>
        <Text className="w-10 font-secondaryMedium text-gray-500 text-center text-sm">
          ✓
        </Text>
        <Text className="w-8" />
      </View>

      {/* Sets Rows - Inline Editable */}
      {exercise.sets.map((set: any, index: number) => (
        <SetRow
          key={set.id}
          exerciseId={exercise.id}
          set={set}
          index={index}
          onFocus={() => handleSetFocus(index)}
        />
      ))}

      {/* Add Working Set Button */}
      <Pressable
        onPress={() => addSet(exercise.id)}
        className="mt-3 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
      >
        <Text className="font-secondaryMedium text-gray-500 text-center text-sm">
          + Add working set
        </Text>
      </Pressable>
    </Card>
  );
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { currentWorkout, endWorkout, cancelWorkout } = useWorkoutStore();

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
        <AddExerciseForm />

        {currentWorkout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}

        <View className="gap-3 mt-4 mb-8">
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
