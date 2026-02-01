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
  CurrentProgramSession,
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

  // Get today's prescribed workout
  const getTodaySession = useCallback((): ProgramSession | null => {
    if (!program) return null;
    return getPrescribedSession(program);
  }, [program]);

  /**
   * Start a new program session.
   * Creates currentSession and sets sessionStatus to "in_progress".
   * Call this when user taps "Start Session".
   */
  const startSession = useCallback(async (): Promise<void> => {
    if (!program) return;

    const now = Date.now();
    sessionStartTimeRef.current = now;

    const newSession: CurrentProgramSession = {
      sessionIndex: program.sessionIndex,
      startedAt: now,
      repsPerLift: {
        "weighted-pullups": [null, null, null, null, null],
        "weighted-dips": [null, null, null, null, null],
        squats: [null, null, null, null, null],
      },
      currentLiftIndex: 0,
      currentSetIndex: 0,
    };

    const updatedProgram: ProgramInstance = {
      ...program,
      currentSession: newSession,
      sessionStatus: "in_progress",
    };

    await saveProgram(updatedProgram);
    setProgram(updatedProgram);
  }, [program]);

  /**
   * Update the current session state (for persisting reps during workout).
   * Call this whenever user enters reps or progresses.
   */
  const updateCurrentSession = useCallback(
    async (updates: Partial<CurrentProgramSession>): Promise<void> => {
      if (!program || !program.currentSession) return;

      const updatedSession: CurrentProgramSession = {
        ...program.currentSession,
        ...updates,
      };

      const updatedProgram: ProgramInstance = {
        ...program,
        currentSession: updatedSession,
      };

      await saveProgram(updatedProgram);
      setProgram(updatedProgram);
    },
    [program],
  );

  /**
   * Cancel the current session without saving to history.
   * Clears currentSession and resets sessionStatus to "idle".
   */
  const cancelSession = useCallback(async (): Promise<void> => {
    if (!program) return;

    sessionStartTimeRef.current = null;

    const updatedProgram: ProgramInstance = {
      ...program,
      currentSession: null,
      sessionStatus: "idle",
    };

    await saveProgram(updatedProgram);
    setProgram(updatedProgram);
  }, [program]);

  // Record a completed session
  const recordSession = useCallback(
    async (inputs: RecordSessionInput[]) => {
      if (!program) return;

      const endTime = Date.now();
      const startTime =
        program.currentSession?.startedAt ||
        sessionStartTimeRef.current ||
        endTime - 30 * 60 * 1000;

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

      // Update program - clear session and advance to next
      const updatedProgram: ProgramInstance = {
        ...program,
        sessionIndex: program.sessionIndex + 1,
        lifts: updatedLifts,
        history: [...program.history, sessionPerformance],
        currentSession: null,
        sessionStatus: "idle",
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

  // Computed states
  const hasActiveProgram = !!program && program.status === "active";
  const hasSessionInProgress =
    hasActiveProgram &&
    program.sessionStatus === "in_progress" &&
    program.currentSession !== null;

  return {
    program,
    loading,
    refresh: loadProgram,
    getTodaySession,
    startSession,
    updateCurrentSession,
    cancelSession,
    recordSession,
    abandonProgram,
    finishProgram,
    hasActiveProgram,
    hasSessionInProgress,
  };
}
