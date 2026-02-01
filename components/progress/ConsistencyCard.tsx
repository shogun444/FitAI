import { Card } from "@/components/ui/Card";
import { ConsistencyMetrics } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

// ============================================
// MetricItem Component
// ============================================

interface MetricItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MetricItem = memo(function MetricItem({
  label,
  value,
  icon,
}: MetricItemProps) {
  return (
    <View className="w-1/2 mb-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={16} color="#65a30d" />
        <Text className="font-secondary text-gray-500 text-xs ml-1.5">
          {label}
        </Text>
      </View>
      <Text className="font-secondarySemiBold text-2xl text-gray-900 dark:text-white">
        {value}
      </Text>
    </View>
  );
});

// ============================================
// ConsistencyCard Component
// ============================================

interface ConsistencyCardProps {
  metrics: ConsistencyMetrics;
}

export const ConsistencyCard = memo(function ConsistencyCard({
  metrics,
}: ConsistencyCardProps) {
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
});
