import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5 bg-background-light dark:bg-background-dark">
      <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white mb-2">
        This is a modal
      </Text>
      <Text className="font-secondary text-base text-gray-500 dark:text-gray-400 mb-8">
        Your fintech experience starts here
      </Text>
      <Link href="/" dismissTo asChild>
        <Pressable className="mt-4 py-4 px-8 bg-primary rounded-xl active:opacity-80">
          <Text className="font-primarySemiBold text-background-dark text-base">
            Go to home screen
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
