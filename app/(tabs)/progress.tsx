import { Card, Heading, Subheading } from "@/components";
import { useWorkoutStore } from "@/store";
import {
  calculateProgressData,
  ConsistencyMetrics,
  ExercisePR,
  StrengthMetrics,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// ProgressSummaryCard (Tier 1 - Consistency)
// ============================================

interface ProgressSummaryCardProps {
  metrics: ConsistencyMetrics;
}

function ProgressSummaryCard({ metrics }: ProgressSummaryCardProps) {
  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4">
        Consistency
      </Text>

      <View className="flex-row flex-wrap">
        <MetricItem
          label="Total Workouts"
          value={metrics.totalWorkouts.toString()}
          icon="fitness"
        />
        <MetricItem
          label="This Week"
          value={metrics.workoutsThisWeek.toString()}
          icon="calendar"
        />
        <MetricItem
          label="This Month"
          value={metrics.workoutsThisMonth.toString()}
          icon="calendar-outline"
        />
        <MetricItem
          label="Current Streak"
          value={`${metrics.currentStreak} day${metrics.currentStreak !== 1 ? "s" : ""}`}
          icon="flame"
        />
      </View>
    </Card>
  );
}

// ============================================
// MetricItem Component
// ============================================

interface MetricItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function MetricItem({ label, value, icon }: MetricItemProps) {
  return (
    <View className="w-1/2 mb-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={16} color="#c9f158" />
        <Text className="font-secondary text-gray-500 text-xs ml-1.5">
          {label}
        </Text>
      </View>
      <Text className="font-primaryBold text-2xl text-gray-900 dark:text-white">
        {value}
      </Text>
    </View>
  );
}

// ============================================
// StrengthSummaryCard (Tier 2 - PRs)
// ============================================

interface StrengthSummaryCardProps {
  metrics: StrengthMetrics;
}

function StrengthSummaryCard({ metrics }: StrengthSummaryCardProps) {
  if (metrics.exercisePRs.length === 0) {
    return (
      <Card className="mb-4">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-2">
          Strength
        </Text>
        <Text className="font-secondary text-gray-500">
          Complete some workouts to see your personal records.
        </Text>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          Strength
        </Text>
        <View className="flex-row items-center bg-primary/20 px-2.5 py-1 rounded-full">
          <Ionicons name="trophy" size={14} color="#c9f158" />
          <Text className="font-secondaryMedium text-primary text-sm ml-1">
            {metrics.totalPRCount} PR{metrics.totalPRCount !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View>
        {metrics.exercisePRs.map((pr) => (
          <ExercisePRItem key={pr.exerciseName} pr={pr} />
        ))}
      </View>
    </Card>
  );
}

// ============================================
// ExercisePRItem Component
// ============================================

interface ExercisePRItemProps {
  pr: ExercisePR;
}

function ExercisePRItem({ pr }: ExercisePRItemProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatSet = (weight: number, reps: number) => {
    return `${weight} kg × ${reps} reps`;
  };

  return (
    <View className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <Text className="font-primaryMedium text-base text-gray-900 dark:text-white mb-1">
        {pr.exerciseName}
      </Text>

      <View className="flex-row items-center">
        <Ionicons name="trophy-outline" size={14} color="#c9f158" />
        <Text className="font-secondaryMedium text-sm text-primary ml-1.5">
          {formatSet(pr.bestSet.weight, pr.bestSet.reps)}
        </Text>
        <Text className="font-secondary text-xs text-gray-400 ml-2">
          {formatDate(pr.bestSet.date)}
        </Text>
      </View>

      {pr.lastSession && (
        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text className="font-secondary text-sm text-gray-500 ml-1.5">
            Last: {formatSet(pr.lastSession.weight, pr.lastSession.reps)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// EmptyState Component
// ============================================

function EmptyState() {
  return (
    <View className="items-center py-12">
      <Ionicons name="stats-chart-outline" size={48} color="#6b7280" />
      <Text className="font-primaryMedium text-gray-500 text-lg mt-4">
        No progress yet
      </Text>
      <Text className="font-secondary text-gray-400 text-sm mt-1 text-center px-8">
        Complete your first workout to start tracking your progress.
      </Text>
    </View>
  );
}

// ============================================
// Main ProgressScreen Component
// ============================================

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

  // Memoize progress calculations to avoid recomputing on every render
  const progressData = useMemo(() => {
    return calculateProgressData(pastWorkouts);
  }, [pastWorkouts]);

  const hasWorkouts = pastWorkouts.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <Heading className="mb-2">Progress</Heading>
        <Subheading className="mb-6">Your training at a glance</Subheading>

        {!isLoading && !hasWorkouts ? (
          <EmptyState />
        ) : (
          <>
            <ProgressSummaryCard metrics={progressData.consistency} />
            <StrengthSummaryCard metrics={progressData.strength} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
