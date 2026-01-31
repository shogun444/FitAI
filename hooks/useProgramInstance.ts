import { mapProgramSessionToHistory } from "@/lib/programHistoryAdapter";
import { processLiftPerformance } from "@/lib/programRules";
import {
  clearActiveProgram,
  completeProgram,
  getActiveProgram,
  saveProgram,
} from "@/lib/programStorage";
import { saveWorkout } from "@/lib/storage";
import {
  LiftPerformance,
  ProgramInstance,
  ProgramLiftId,
  ProgramSession,
  SessionPerformance,
  getPrescribedSession,
} from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface RecordSessionInput {
  liftId: ProgramLiftId;
  repsPerSet: number[];
  feltEasy: boolean;
}

export function useProgramInstance() {
  const [program, setProgram] = useState<ProgramInstance | null>(null);
  const [loading, setLoading] = useState(true);

  // Track session start time for history entry
  const sessionStartTimeRef = useRef<number | null>(null);

  // Load program on mount
  useEffect(() => {
    loadProgram();
  }, []);

  const loadProgram = useCallback(async () => {
    setLoading(true);
    const activeProgram = await getActiveProgram();
    setProgram(activeProgram);
    setLoading(false);
  }, []);

  // Get today's prescribed workout (also marks session start)
  const getTodaySession = useCallback((): ProgramSession | null => {
    if (!program) return null;
    // Mark session start time when user views today's workout
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }
    return getPrescribedSession(program);
  }, [program]);

  // Record a completed session
  const recordSession = useCallback(
    async (inputs: RecordSessionInput[]) => {
      if (!program) return;

      const endTime = Date.now();
      const startTime = sessionStartTimeRef.current || endTime - 30 * 60 * 1000; // Default 30min if not set

      // Process each lift performance
      const liftPerformances: LiftPerformance[] = inputs.map((input) => {
        const liftState = program.lifts.find((l) => l.liftId === input.liftId)!;
        return processLiftPerformance(
          input.liftId,
          liftState.currentWeight,
          input.repsPerSet,
          input.feltEasy,
        );
      });

      // Create session performance record
      const sessionPerformance: SessionPerformance = {
        sessionIndex: program.sessionIndex,
        date: endTime,
        lifts: liftPerformances,
      };

      // Update lift states with new weights
      const updatedLifts = program.lifts.map((lift) => {
        const perf = liftPerformances.find((p) => p.liftId === lift.liftId);
        if (!perf) return lift;
        return {
          ...lift,
          currentWeight: perf.nextWeight,
          lastPerformance: perf,
        };
      });

      // Update program
      const updatedProgram: ProgramInstance = {
        ...program,
        sessionIndex: program.sessionIndex + 1,
        lifts: updatedLifts,
        history: [...program.history, sessionPerformance],
      };

      // Get prescribed session for mapping (before saving updated program)
      const prescribedSession = getPrescribedSession(program);

      // Save program state
      await saveProgram(updatedProgram);
      setProgram(updatedProgram);

      // === SAVE TO WORKOUT HISTORY ===
      // Map program session to WorkoutSession and persist
      const recordedLifts = inputs.map((input) => ({
        lift: prescribedSession.lifts.find((l) => l.liftId === input.liftId)!,
        repsPerSet: input.repsPerSet,
      }));

      const historyEntry = mapProgramSessionToHistory({
        program,
        sessionIndex: program.sessionIndex,
        recordedLifts,
        liftPerformances,
        startTime,
        endTime,
      });

      await saveWorkout(historyEntry);

      // Reset session start time for next session
      sessionStartTimeRef.current = null;

      return {
        sessionPerformance,
        liftPerformances,
      };
    },
    [program],
  );

  // Abandon the program
  const abandonProgram = useCallback(async () => {
    await clearActiveProgram();
    setProgram(null);
  }, []);

  // Complete the program (e.g., after 12 weeks)
  const finishProgram = useCallback(async () => {
    await completeProgram();
    setProgram(null);
  }, []);

  return {
    program,
    loading,
    refresh: loadProgram,
    getTodaySession,
    recordSession,
    abandonProgram,
    finishProgram,
    hasActiveProgram: !!program && program.status === "active",
  };
}
