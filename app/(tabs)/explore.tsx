import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Text className="font-primaryBold text-3xl text-gray-900 dark:text-white mb-6">
          Explore
        </Text>

        <View className="gap-4">
          <View className="bg-surface dark:bg-surface-dark rounded-xl p-5">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Workouts
            </Text>
            <Text className="font-secondary text-gray-500 dark:text-gray-400">
              Discover AI-powered workout plans tailored to your goals.
            </Text>
          </View>

          <View className="bg-surface dark:bg-surface-dark rounded-xl p-5">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Nutrition
            </Text>
            <Text className="font-secondary text-gray-500 dark:text-gray-400">
              Track your meals and get personalized nutrition advice.
            </Text>
          </View>

          <View className="bg-surface dark:bg-surface-dark rounded-xl p-5">
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Progress
            </Text>
            <Text className="font-secondary text-gray-500 dark:text-gray-400">
              Monitor your fitness journey with detailed analytics.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
