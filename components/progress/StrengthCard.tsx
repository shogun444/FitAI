import { Card } from "@/components/ui/Card";
import { formatWeightReps } from "@/lib/formatters";
import { ExercisePR, StrengthMetrics } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

// ============================================
// ExercisePRItem Component
// ============================================

interface ExercisePRItemProps {
  pr: ExercisePR;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const ExercisePRItem = memo(function ExercisePRItem({
  pr,
}: ExercisePRItemProps) {
  return (
    <View className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <Text className="font-primaryMedium text-base text-gray-900 dark:text-white mb-1.5">
        {pr.exerciseName}
      </Text>

      <View className="flex-row items-center">
        <Ionicons name="trophy-outline" size={14} color="#c9f158" />
        <Text className="font-secondaryMedium text-sm text-primary ml-1.5">
          {formatWeightReps(pr.bestSet.weight, pr.bestSet.reps, {
            showRepsSuffix: true,
          })}
        </Text>
        <Text className="font-secondary text-xs text-gray-400 ml-2">
          {formatDate(pr.bestSet.date)}
        </Text>
      </View>

      {pr.lastSession && (
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text className="font-secondary text-sm text-gray-500 ml-1.5">
            Last:{" "}
            {formatWeightReps(pr.lastSession.weight, pr.lastSession.reps, {
              showRepsSuffix: true,
            })}
          </Text>
        </View>
      )}
    </View>
  );
});

// ============================================
// StrengthCard Component
// ============================================

interface StrengthCardProps {
  metrics: StrengthMetrics;
}

export const StrengthCard = memo(function StrengthCard({
  metrics,
}: StrengthCardProps) {
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
        <View className="flex-row items-center bg-primary/20 px-2.5 py-1.5 rounded-full">
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
});
