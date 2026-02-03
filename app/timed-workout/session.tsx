import { TimedWorkoutSession } from "@/components/guided-session";
import { getTimedWorkoutById } from "@/data/timed-workouts";
import { saveWorkout } from "@/lib/storage";
import { Exercise, WorkoutSession, WorkoutSet } from "@/types";
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

    // Map timed workout to WorkoutSession for history
    const exercises: Exercise[] = program.steps
      .filter((step) => step.type === "exercise")
      .map((step) => ({
        id: Crypto.randomUUID(),
        name: step.name,
        sets: [
          {
            id: Crypto.randomUUID(),
            reps: null,
            weight: null,
            completed: true,
            isDefault: false,
            createdAt: endTime,
          } as WorkoutSet,
        ],
        createdAt: startTimeRef.current,
      }));

    const session: WorkoutSession = {
      id: Crypto.randomUUID(),
      exercises,
      startedAt: startTimeRef.current,
      endedAt: endTime,
      duration: duration > 0 ? duration : program.totalDuration,
      isProgramWorkout: true,
      programId: program.id,
      programName: program.name,
    };

    // Save to workout history
    await saveWorkout(session);

    // Navigate to summary
    router.replace({
      pathname: "/timed-workout/summary",
      params: {
        id: program.id,
        duration: duration.toString(),
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
