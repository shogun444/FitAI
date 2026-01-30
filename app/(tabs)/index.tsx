import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="font-primaryBold text-4xl text-gray-900 dark:text-white mb-2">
          fitAI
        </Text>
        <Text className="font-secondary text-lg text-gray-500 dark:text-gray-400 text-center mb-10">
          Your AI-powered fitness companion
        </Text>

        <View className="w-full max-w-sm gap-4">
          <Pressable className="bg-primary rounded-xl py-4 px-6 active:opacity-80">
            <Text className="font-primarySemiBold text-background-dark text-center text-base">
              Get Started
            </Text>
          </Pressable>

          <Link href="/modal" asChild>
            <Pressable className="border border-gray-200 dark:border-gray-800 bg-surface dark:bg-surface-dark rounded-xl py-4 px-6 active:opacity-80">
              <Text className="font-primaryMedium text-gray-900 dark:text-white text-center text-base">
                Open Modal
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
