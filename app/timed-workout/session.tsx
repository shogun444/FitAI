import { TimedWorkoutSession } from "@/components/guided-session";
import { formatDuration, getTimedWorkoutById } from "@/data/timed-workouts";
import { saveWorkout } from "@/lib/storage";
import { WorkoutSession } from "@/types";
import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";

/**
 * Timed Workout Session Screen
 *
 * Runs the follow-along workout with auto-advancing timers.
 */
export default function TimedWorkoutSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startTimeRef = useRef(Date.now());

  const program = getTimedWorkoutById(id);

  if (!program) {
    router.back();
    return null;
  }

  const handleComplete = async () => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTimeRef.current) / 1000);

    // For timed workouts, we store time-based data only (no fake sets/reps/weight)
    const session: WorkoutSession = {
      id: Crypto.randomUUID(),
      exercises: [], // No exercises for timed workouts - we track time only
      startedAt: startTimeRef.current,
      endedAt: endTime,
      duration: duration > 0 ? duration : program.totalDuration,

      // Program metadata
      isProgramWorkout: true,
      programId: program.id,
      programName: program.name,
      progressionSummary: `${formatDuration(program.totalDuration)} follow-along`,

      // Timed workout specific fields
      isTimedWorkout: true,
      totalTimePlanned: program.totalDuration,
      totalTimeCompleted: duration > 0 ? duration : program.totalDuration,
    };

    // Build exercise data for summary page (same format as pullup program)
    const exerciseData = program.steps
      .filter((step) => step.type === "exercise")
      .map((step) => ({
        name: step.name,
        sets: [{ time: step.duration }],
      }));

    // Save to workout history
    await saveWorkout(session);

    // Navigate to summary
    router.replace({
      pathname: "/timed-workout/summary",
      params: {
        id: program.id,
        duration: duration.toString(),
        exerciseData: JSON.stringify(exerciseData),
      },
    } as any);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TimedWorkoutSession
      program={program}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
