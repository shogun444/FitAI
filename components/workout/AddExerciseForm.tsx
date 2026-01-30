import { Heading } from "@/components/ui/Heading";
import { getExercises } from "@/lib/storage";
import { useWorkoutStore } from "@/store";
import { ExerciseTemplate } from "@/types";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../ui/Card";

interface AddExerciseFormProps {
  autoOpen?: boolean;
}

export function AddExerciseForm({ autoOpen = false }: AddExerciseFormProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);

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
            <Pressable
              onPress={() => setModalVisible(false)}
              className="py-2 px-3"
            >
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
