import { ProgramInstance } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRAM_INSTANCE_KEY = "program_instance";
const PROGRAM_HISTORY_KEY = "program_history";

// Mutex for safe concurrent access
let storageMutex: Promise<void> = Promise.resolve();

function withMutex<T>(fn: () => Promise<T>): Promise<T> {
  const result = storageMutex.then(fn).catch((e) => {
    throw e;
  });
  storageMutex = result.then(
    () => {},
    () => {},
  );
  return result;
}

/**
 * Get the active program instance
 */
export async function getActiveProgram(): Promise<ProgramInstance | null> {
  return withMutex(async () => {
    const raw = await AsyncStorage.getItem(PROGRAM_INSTANCE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProgramInstance;
  });
}

/**
 * Save a program instance (create or update)
 */
export async function saveProgram(program: ProgramInstance): Promise<void> {
  return withMutex(async () => {
    await AsyncStorage.setItem(PROGRAM_INSTANCE_KEY, JSON.stringify(program));
  });
}

/**
 * Clear the active program (on completion or abandonment)
 */
export async function clearActiveProgram(): Promise<void> {
  return withMutex(async () => {
    await AsyncStorage.removeItem(PROGRAM_INSTANCE_KEY);
  });
}

/**
 * Complete the current program and move to history
 */
export async function completeProgram(): Promise<void> {
  return withMutex(async () => {
    const raw = await AsyncStorage.getItem(PROGRAM_INSTANCE_KEY);
    if (!raw) return;

    const program = JSON.parse(raw) as ProgramInstance;
    program.status = "completed";

    // Add to history
    const historyRaw = await AsyncStorage.getItem(PROGRAM_HISTORY_KEY);
    const history: ProgramInstance[] = historyRaw ? JSON.parse(historyRaw) : [];
    history.push(program);
    await AsyncStorage.setItem(PROGRAM_HISTORY_KEY, JSON.stringify(history));

    // Clear active
    await AsyncStorage.removeItem(PROGRAM_INSTANCE_KEY);
  });
}

/**
 * Get program history
 */
export async function getProgramHistory(): Promise<ProgramInstance[]> {
  return withMutex(async () => {
    const raw = await AsyncStorage.getItem(PROGRAM_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProgramInstance[];
  });
}
