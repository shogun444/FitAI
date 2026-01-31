import { Card, Heading, Subheading } from "@/components";
import { ProgramCard } from "@/components/programs";
import { PROGRAMS } from "@/data/programs";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-6">Explore</Heading>

        {/* Programs Section */}
        <View className="mb-6">
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
            Programs
          </Text>
          <View className="gap-3">
            {PROGRAMS.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onPress={() => router.push(`/program/${program.id}` as Href)}
              />
            ))}
          </View>
        </View>

        {/* Quick Links Section */}
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-3">
          Quick Links
        </Text>
        <View className="gap-4">
          <Pressable onPress={() => router.push("/workout/history")}>
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Workouts
              </Text>
              <Subheading>
                Discover AI-powered workout plans tailored to your goals.
              </Subheading>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push("/nutrition")}>
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Nutrition
              </Text>
              <Subheading>
                Track your meals and get personalized nutrition advice.
              </Subheading>
            </Card>
          </Pressable>

          <Pressable onPress={() => router.push("/progress")}>
            <Card>
              <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
                Progress
              </Text>
              <Subheading>
                Track your consistency and personal records.
              </Subheading>
            </Card>
          </Pressable>

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
