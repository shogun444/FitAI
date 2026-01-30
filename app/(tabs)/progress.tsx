import { ConsistencyCard, StrengthCard } from "@/components/progress";
import { EmptyState, Heading, Subheading } from "@/components/ui";
import { useProgressMetrics } from "@/hooks/useProgressMetrics";
import { useWorkoutStore } from "@/store";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressScreen() {
  const { pastWorkouts, loadWorkouts } = useWorkoutStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await loadWorkouts();
      setIsLoading(false);
    };
    load();
  }, []);

  const { data, hasWorkouts } = useProgressMetrics(pastWorkouts);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-2">Progress</Heading>
        <Subheading className="mb-8">Your training at a glance</Subheading>

        {!isLoading && !hasWorkouts ? (
          <EmptyState
            icon="stats-chart-outline"
            title="No progress yet"
            description="Complete your first workout to start tracking your progress."
          />
        ) : (
          <>
            <ConsistencyCard metrics={data.consistency} />
            <StrengthCard metrics={data.strength} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
