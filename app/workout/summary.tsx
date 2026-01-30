import { Button, Card, Heading, Subheading } from "@/components";
import { useWorkoutStore } from "@/store";
import { WorkoutSession, WorkoutSet } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return `${mins} min`;
  }
  return `${mins} min ${secs} sec`;
}

interface PR {
  exerciseName: string;
  weight: number;
  reps: number;
  isNew: boolean;
}

/**
 * Compare if currentSet is better than previousBest
 * Better = higher weight, or same weight with more reps
 */
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

/**
 * Find the best set in an array of sets
 */
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

/**
 * Detect PRs by comparing this workout's exercises against past workouts
 */
function detectPRs(
  workout: WorkoutSession,
  pastWorkouts: WorkoutSession[],
): PR[] {
  const prs: PR[] = [];

  // Build a map of previous bests per exercise (excluding this workout)
  const previousBests = new Map<string, { weight: number; reps: number }>();

  for (const pastWorkout of pastWorkouts) {
    // Skip if this is the same workout (shouldn't happen, but safety check)
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

  // Check each exercise in the current workout for PRs
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
// Summary Stat Item Component
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
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          {value}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// PR List Component
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
          className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          <Ionicons name="star" size={16} color="#c9f158" />
          <View className="ml-3 flex-1">
            <Text className="font-primaryMedium text-gray-900 dark:text-white">
              {pr.exerciseName}
            </Text>
            <Text className="font-secondary text-primary text-sm">
              New best: {pr.weight} kg × {pr.reps}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
      <Ionicons name="barbell-outline" size={48} color="#6b7280" />
      <Text className="font-primaryMedium text-gray-500 text-lg mt-4">
        No workout summary
      </Text>
      <Text className="font-secondary text-gray-400 text-sm mt-1 text-center">
        Complete a workout to see your summary.
      </Text>
      <View className="mt-6 w-full">
        <Button title="Back to Home" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}

// ============================================
// Main Session Summary Screen
// ============================================

export default function SessionSummaryScreen() {
  const router = useRouter();
  const { lastCompletedWorkout, pastWorkouts } = useWorkoutStore();

  // Calculate all metrics from the completed workout
  const summary = useMemo(() => {
    if (!lastCompletedWorkout) return null;

    // Duration
    const duration = lastCompletedWorkout.duration;

    // Exercises with at least one completed set
    const exercisesCompleted = lastCompletedWorkout.exercises.filter((ex) =>
      ex.sets.some((s) => s.completed),
    ).length;

    // Total completed sets
    const setsCompleted = lastCompletedWorkout.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0,
    );

    // PRs (compare against past workouts, excluding the current one)
    const prs = detectPRs(
      lastCompletedWorkout,
      pastWorkouts.filter((w) => w.id !== lastCompletedWorkout.id),
    );

    return {
      duration,
      exercisesCompleted,
      setsCompleted,
      prs,
    };
  }, [lastCompletedWorkout, pastWorkouts]);

  if (!lastCompletedWorkout || !summary) {
    return <EmptyState />;
  }

  const handleDone = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-3">
            <Ionicons name="checkmark-circle" size={40} color="#c9f158" />
          </View>
          <Heading className="text-2xl">Workout Complete</Heading>
          <Subheading className="text-center mt-1">Great job!</Subheading>
        </View>

        {/* Stats Card */}
        <Card className="mb-4">
          <SummaryStatItem
            icon="time-outline"
            label="Duration"
            value={formatDuration(summary.duration)}
          />
          <SummaryStatItem
            icon="barbell-outline"
            label="Exercises"
            value={summary.exercisesCompleted.toString()}
          />
          <SummaryStatItem
            icon="layers-outline"
            label="Sets Completed"
            value={summary.setsCompleted.toString()}
          />
        </Card>

        {/* PRs */}
        <PRList prs={summary.prs} />

        {/* Edge case: No completed sets */}
        {summary.setsCompleted === 0 && (
          <Card className="mb-4 bg-yellow-50 dark:bg-yellow-900/20">
            <Text className="font-secondary text-yellow-700 dark:text-yellow-300 text-sm text-center">
              No sets were completed in this session.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Done Button */}
      <View className="px-6 py-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <Button title="Done" onPress={handleDone} />
      </View>
    </SafeAreaView>
  );
}
