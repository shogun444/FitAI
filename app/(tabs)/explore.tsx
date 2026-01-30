import { Card, Heading, Subheading } from "@/components";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-6">Explore</Heading>

        <View className="gap-4">
          <Pressable onPress={() => router.push('/workout/history')}> 
             <Card>
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Workouts
            </Text>
            <Subheading>
              Discover AI-powered workout plans tailored to your goals.
            </Subheading>
          </Card>
          </Pressable>
         

          <Card>
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Nutrition
            </Text>
            <Subheading>
              Track your meals and get personalized nutrition advice.
            </Subheading>
          </Card>

          <Card>
            <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
              Progress
            </Text>
            <Subheading>
              Monitor your fitness journey with detailed analytics.
            </Subheading>
          </Card>

          <Pressable onPress={() => router.push("/feedback")}>
            <Card className="border border-primary/30">
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Feedback
              </Text>
              <Subheading>
                Share your thoughts and help us improve FitAI.
              </Subheading>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
