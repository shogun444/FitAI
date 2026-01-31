import { processLiftPerformance } from "@/lib/programRules";
import {
  clearActiveProgram,
  completeProgram,
  getActiveProgram,
  saveProgram,
} from "@/lib/programStorage";
import {
  LiftPerformance,
  ProgramInstance,
  ProgramLiftId,
  ProgramSession,
  SessionPerformance,
  getPrescribedSession,
} from "@/types";
import { useCallback, useEffect, useState } from "react";

interface RecordSessionInput {
  liftId: ProgramLiftId;
  repsPerSet: number[];
  feltEasy: boolean;
}

export function useProgramInstance() {
  const [program, setProgram] = useState<ProgramInstance | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Get today's prescribed workout
  const getTodaySession = useCallback((): ProgramSession | null => {
    if (!program) return null;
    return getPrescribedSession(program);
  }, [program]);

  // Record a completed session
  const recordSession = useCallback(
    async (inputs: RecordSessionInput[]) => {
      if (!program) return;

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
        date: Date.now(),
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

      await saveProgram(updatedProgram);
      setProgram(updatedProgram);

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
