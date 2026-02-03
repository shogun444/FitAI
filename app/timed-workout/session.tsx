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

    // Build exercises with time-based sets for history display
    const exercises = program.steps
      .filter((step) => step.type === "exercise")
      .map((step, index) => ({
        id: Crypto.randomUUID(),
        name: step.name,
        sets: [
          {
            id: Crypto.randomUUID(),
            reps: null,
            weight: null,
            time: step.duration, // Store time in seconds
            completed: true,
            isDefault: false,
            createdAt: startTimeRef.current + index * 1000,
          },
        ],
        createdAt: startTimeRef.current + index * 1000,
      }));

    // For timed workouts, we store time-based data
    const session: WorkoutSession = {
      id: Crypto.randomUUID(),
      exercises: exercises,
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

    // Save to workout history
    await saveWorkout(session);

    // Build exercise data for summary page
    const exerciseData = exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets.map((s) => ({ time: s.time })),
    }));

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
