/**
 * Adapter to map Program Session data to WorkoutSession history entry.
 *
 * This ensures paid program workouts are stored in the SAME history
 * as free workouts, making them first-class citizens in the product.
 */

import {
  Exercise,
  LiftPerformance,
  PrescribedLift,
  ProgramInstance,
  ProgramLiftId,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import * as Crypto from "expo-crypto";

interface RecordedLift {
  lift: PrescribedLift;
  repsPerSet: number[];
}

interface MapProgramSessionParams {
  program: ProgramInstance;
  sessionIndex: number;
  recordedLifts: RecordedLift[];
  liftPerformances: LiftPerformance[];
  startTime: number;
  endTime: number;
}

/**
 * Maps a completed program session to a WorkoutSession for history storage.
 *
 * Converts:
 * - Program lifts → Exercise entries
 * - Sets with prescribed weight + actual reps → WorkoutSet entries
 * - Program metadata → optional fields on WorkoutSession
 */
export function mapProgramSessionToHistory({
  program,
  sessionIndex,
  recordedLifts,
  liftPerformances,
  startTime,
  endTime,
}: MapProgramSessionParams): WorkoutSession {
  // Convert program lifts to exercises
  const exercises: Exercise[] = recordedLifts.map((recorded) => {
    const sets: WorkoutSet[] = recorded.repsPerSet.map((reps, index) => ({
      id: Crypto.randomUUID(),
      reps: reps,
      weight: recorded.lift.weight,
      completed: reps > 0,
      isDefault: false,
      createdAt: endTime,
    }));

    return {
      id: Crypto.randomUUID(),
      name: recorded.lift.name,
      sets,
      createdAt: startTime,
    };
  });

  // Generate progression summary
  const progressionSummary = generateProgressionSummary(liftPerformances);

  // Duration in seconds
  const duration = Math.floor((endTime - startTime) / 1000);

  return {
    id: Crypto.randomUUID(),
    exercises,
    startedAt: startTime,
    endedAt: endTime,
    duration: duration > 0 ? duration : 0,

    // Program-specific metadata
    isProgramWorkout: true,
    programId: program.programId,
    programName: "Weighted Calisthenics 5×5",
    sessionIndex: sessionIndex,
    progressionSummary,
  };
}

/**
 * Generate a human-readable summary of lift progressions.
 * e.g., "2 lifts increased weight" or "All lifts maintained"
 */
function generateProgressionSummary(
  liftPerformances: LiftPerformance[],
): string {
  const increased = liftPerformances.filter(
    (p) => p.nextWeight > p.weight,
  ).length;
  const maintained = liftPerformances.filter(
    (p) => p.nextWeight === p.weight,
  ).length;

  if (increased === liftPerformances.length) {
    return "All lifts progressed! 🎉";
  } else if (increased > 0) {
    return `${increased} lift${increased > 1 ? "s" : ""} progressed`;
  } else if (maintained === liftPerformances.length) {
    return "Building strength at current weights";
  } else {
    return "Session completed";
  }
}
