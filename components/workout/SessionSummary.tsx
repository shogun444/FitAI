import { Card } from "@/components/ui/Card";
import { formatWeightReps } from "@/lib/formatters";
import { WorkoutSession, WorkoutSet } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, View } from "react-native";

// ============================================
// Types
// ============================================

interface PR {
  exerciseName: string;
  weight: number;
  reps: number;
  isNew: boolean;
}

interface SessionSummaryProps {
  workout: WorkoutSession;
  pastWorkouts: WorkoutSession[];
}

// ============================================
// Helpers
// ============================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

function findBestSet(
  sets: WorkoutSet[],
): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  for (const set of sets) {
    if (!set.completed || set.weight === null || set.reps === null) continue;
    if (
      !best ||
      set.weight > best.weight ||
      (set.weight === best.weight && set.reps > best.reps)
    ) {
      best = { weight: set.weight, reps: set.reps };
    }
  }
  return best;
}

function isBetterSet(
  currentSet: WorkoutSet,
  previousBest: { weight: number; reps: number } | null,
): boolean {
  if (!previousBest) return true;
  if (currentSet.weight === null || currentSet.reps === null) return false;
  if (currentSet.weight > previousBest.weight) return true;
  if (
    currentSet.weight === previousBest.weight &&
    currentSet.reps > previousBest.reps
  )
    return true;
  return false;
}

function detectPRs(
  workout: WorkoutSession,
  pastWorkouts: WorkoutSession[],
): PR[] {
  const prs: PR[] = [];
  const previousBests = new Map<string, { weight: number; reps: number }>();

  for (const pastWorkout of pastWorkouts) {
    if (pastWorkout.id === workout.id) continue;
    for (const exercise of pastWorkout.exercises) {
      const exerciseName = exercise.name.toLowerCase();
      const bestInSession = findBestSet(exercise.sets);
      if (bestInSession) {
        const existing = previousBests.get(exerciseName);
        if (
          !existing ||
          bestInSession.weight > existing.weight ||
          (bestInSession.weight === existing.weight &&
            bestInSession.reps > existing.reps)
        ) {
          previousBests.set(exerciseName, bestInSession);
        }
      }
    }
  }

  for (const exercise of workout.exercises) {
    const bestInSession = findBestSet(exercise.sets);
    if (!bestInSession) continue;
    const previousBest = previousBests.get(exercise.name.toLowerCase()) ?? null;
    if (
      isBetterSet({ ...bestInSession, completed: true } as any, previousBest)
    ) {
      prs.push({
        exerciseName: exercise.name,
        weight: bestInSession.weight,
        reps: bestInSession.reps,
        isNew: true,
      });
    }
  }

  return prs;
}

// ============================================
// SummaryStatItem Component
// ============================================

interface SummaryStatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function SummaryStatItem({ icon, label, value }: SummaryStatItemProps) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800">
      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#c9f158" />
      </View>
      <View className="flex-1">
        <Text className="font-secondary text-gray-500 text-xs">{label}</Text>
        <Text className="font-secondarySemiBold text-lg text-gray-900 dark:text-white">
          {value}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// PRList Component
// ============================================

interface PRListProps {
  prs: PR[];
}

function PRList({ prs }: PRListProps) {
  if (prs.length === 0) {
    return (
      <Card className="mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trophy-outline" size={20} color="#9ca3af" />
          <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white ml-2">
            Personal Records
          </Text>
        </View>
        <Text className="font-secondary text-gray-500">
          No new PRs this session. Keep pushing!
        </Text>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name="trophy" size={20} color="#c9f158" />
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white ml-2">
          New Personal Records
        </Text>
      </View>
      {prs.map((pr, index) => (
        <View
          key={`${pr.exerciseName}-${index}`}
          className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          <Ionicons name="star" size={16} color="#c9f158" />
          <View className="ml-3 flex-1">
            <Text className="font-primaryMedium text-gray-900 dark:text-white">
              {pr.exerciseName}
            </Text>
            <Text className="font-secondaryMedium text-sm text-primary">
              {formatWeightReps(pr.weight, pr.reps, { showRepsSuffix: true })}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

// ============================================
// SessionSummary Component
// ============================================

export function SessionSummary({ workout, pastWorkouts }: SessionSummaryProps) {
  const prs = useMemo(
    () => detectPRs(workout, pastWorkouts),
    [workout, pastWorkouts],
  );

  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );

  const totalVolume = workout.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed && s.weight && s.reps)
        .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0)
    );
  }, 0);

  return (
    <>
      <Card className="mb-4">
        <SummaryStatItem
          icon="time-outline"
          label="Duration"
          value={formatDuration(workout.duration)}
        />
        <SummaryStatItem
          icon="barbell-outline"
          label="Exercises"
          value={workout.exercises.length.toString()}
        />
        <SummaryStatItem
          icon="layers-outline"
          label="Total Sets"
          value={totalSets.toString()}
        />
        <SummaryStatItem
          icon="trending-up-outline"
          label="Total Volume"
          value={`${totalVolume.toLocaleString()} kg`}
        />
      </Card>

      <PRList prs={prs} />
    </>
  );
}
