/**
 * Adapter to map Program Session data to WorkoutSession history entry.
 *
 * This ensures paid program workouts are stored in the SAME history
 * as free workouts, making them first-class citizens in the product.
 */

import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import {
  Exercise,
  LiftPerformance,
  PrescribedLift,
  ProgramInstance,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import { ActivePullupSession } from "@/types/pullup-program";
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
      time: null,
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

// ============================================
// PULLUP PROGRAM ADAPTER
// ============================================

/**
 * Maps a completed pullup program session to a WorkoutSession for unified history.
 *
 * ARCHITECTURE:
 * - One history for ALL workouts (free + program)
 * - Reuses existing WorkoutSession shape
 * - No separate storage path for program sessions
 * - History UI displays program sessions identically to free workouts
 *
 * @param session - The completed active session with all exercise data
 * @returns WorkoutSession ready for storage via saveWorkout()
 */
export function mapPullupSessionToHistory(
  session: ActivePullupSession,
): WorkoutSession {
  const endTime = Date.now();
  const duration = Math.floor((endTime - session.startedAt) / 1000);

  // Convert each exercise's sets to the WorkoutSession format
  const exercises: Exercise[] = session.exercises.map((exerciseData, index) => {
    const exerciseDefinition = PULLUP_PROGRAM_EXERCISES[index];

    const sets: WorkoutSet[] = exerciseData.sets.map((set, setIdx) => ({
      id: Crypto.randomUUID(),
      reps: set.repsCompleted ?? null,
      weight: null, // Bodyweight exercises
      time: set.timeCompleted ?? null,
      completed: true,
      isDefault: false,
      createdAt: endTime,
    }));

    return {
      id: Crypto.randomUUID(),
      name: exerciseDefinition?.name ?? `Exercise ${index + 1}`,
      sets,
      createdAt: session.startedAt,
    };
  });

  return {
    id: Crypto.randomUUID(),
    exercises,
    startedAt: session.startedAt,
    endedAt: endTime,
    duration: duration > 0 ? duration : 0,

    // Program-specific metadata
    isProgramWorkout: true,
    programId: PULLUP_PROGRAM.id,
    programName: PULLUP_PROGRAM.name,
    sessionIndex: session.sessionNumber,
    progressionSummary: `Session ${session.sessionNumber} of ${PULLUP_PROGRAM.targetSessions}`,
  };
}
