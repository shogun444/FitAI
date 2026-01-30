import { calculateProgressData, ProgressData, WorkoutSession } from "@/types";
import { useMemo } from "react";

interface UseProgressMetricsResult {
  data: ProgressData;
  hasWorkouts: boolean;
  totalWorkouts: number;
}

/**
 * Hook for calculating and memoizing progress metrics from workout history
 * Handles all progress calculations in a single place
 */
export function useProgressMetrics(
  pastWorkouts: WorkoutSession[],
): UseProgressMetricsResult {
  const data = useMemo(() => {
    return calculateProgressData(pastWorkouts);
  }, [pastWorkouts]);

  return {
    data,
    hasWorkouts: pastWorkouts.length > 0,
    totalWorkouts: pastWorkouts.length,
  };
}
