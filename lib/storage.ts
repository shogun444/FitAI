import { EXERCISE_CATALOG } from "@/data/exercises";
import {
  ExerciseTemplate,
  Feedback,
  Reply,
  WorkoutSession,
  addReplyToFeedback,
  sanitizeFeedback,
  toggleReplyUpvote as toggleReplyUpvotePure,
  toggleUpvote as toggleUpvotePure,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { getUserId } from "./user";

const WORKOUTS_KEY = "fitai_workouts";
const EXERCISES_KEY = "fitai_exercises";
const SEED_FLAG_KEY = "fitai_exercises_seeded";
const FEEDBACK_KEY = "fitai_feedback";

// Workout session storage
export async function saveWorkout(workout: WorkoutSession): Promise<void> {
  try {
    const existing = await getWorkouts();
    const updated = [workout, ...existing];
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save workout:", error);
  }
}

export async function getWorkouts(): Promise<WorkoutSession[]> {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load workouts:", error);
    return [];
  }
}

export async function clearWorkouts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUTS_KEY);
  } catch (error) {
    console.error("Failed to clear workouts:", error);
  }
}

// Exercise catalog storage
export async function getExercises(): Promise<ExerciseTemplate[]> {
  try {
    const data = await AsyncStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load exercises:", error);
    return [];
  }
}

export async function saveExercises(
  exercises: ExerciseTemplate[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error("Failed to save exercises:", error);
  }
}

// Seed function - runs once on app start
export async function seedExercises(): Promise<void> {
  try {
    const alreadySeeded = await AsyncStorage.getItem(SEED_FLAG_KEY);
    if (alreadySeeded) {
      return; // Already seeded, do nothing
    }

    const existing = await getExercises();
    if (existing.length > 0) {
      // Data exists, mark as seeded and return
      await AsyncStorage.setItem(SEED_FLAG_KEY, "true");
      return;
    }

    // Seed the exercise catalog
    await saveExercises(EXERCISE_CATALOG);
    await AsyncStorage.setItem(SEED_FLAG_KEY, "true");
    console.log("Exercise catalog seeded successfully");
  } catch (error) {
    console.error("Failed to seed exercises:", error);
  }
}

// Feedback storage
// ============================================
// Architecture notes:
// - All feedback operations are atomic (read-modify-write)
// - upvotedBy array is the source of truth for upvotes
// - Rapid tapping handled by optimistic UI + eventual consistency
// - Corrupted data sanitized on load
// ============================================

/**
 * In-flight operation lock to prevent race conditions.
 * Simple mutex for sequential write operations.
 */
let feedbackWriteLock: Promise<void> = Promise.resolve();

/**
 * Execute a feedback write operation with mutex lock.
 * Ensures operations complete in order, preventing race conditions.
 */
async function withFeedbackLock<T>(operation: () => Promise<T>): Promise<T> {
  // Chain this operation after the current lock releases
  const currentLock = feedbackWriteLock;
  let resolve: () => void;
  feedbackWriteLock = new Promise((r) => {
    resolve = r;
  });

  try {
    await currentLock; // Wait for previous operation
    return await operation();
  } finally {
    resolve!(); // Release lock for next operation
  }
}

/**
 * Load all feedback from storage with data sanitization.
 * Handles corrupted or legacy data gracefully.
 */
export async function getFeedback(): Promise<Feedback[]> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Sanitize each item, filter out corrupted entries
    const sanitized = parsed
      .map((item) => sanitizeFeedback(item))
      .filter((item): item is Feedback => item !== null);

    return sanitized;
  } catch (error) {
    console.error("Failed to load feedback:", error);
    return [];
  }
}

/**
 * Save feedback array to storage.
 * Internal use only - external code should use addFeedback/toggleFeedbackUpvote.
 */
async function saveFeedback(feedback: Feedback[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (error) {
    console.error("Failed to save feedback:", error);
    throw error; // Propagate to caller for error handling
  }
}

/**
 * Add new feedback from the current user.
 * Atomic operation with mutex lock.
 *
 * @param content - The feedback text
 * @returns The created feedback item
 */
export async function addFeedback(content: string): Promise<Feedback> {
  const userId = getUserId();

  const newFeedback: Feedback = {
    id: Crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    authorId: userId,
    upvotedBy: [], // Start with no upvotes
    replies: [], // Start with no replies
  };

  await withFeedbackLock(async () => {
    const existing = await getFeedback();
    await saveFeedback([newFeedback, ...existing]);
  });

  return newFeedback;
}

/**
 * Toggle upvote for a feedback item.
 * Uses pure toggle function for deterministic behavior.
 * Atomic operation with mutex lock.
 *
 * @param feedbackId - The feedback to toggle upvote on
 * @returns The updated feedback item, or null if not found
 */
export async function toggleFeedbackUpvote(
  feedbackId: string,
): Promise<Feedback | null> {
  const userId = getUserId();

  return withFeedbackLock(async () => {
    const feedbacks = await getFeedback();
    const index = feedbacks.findIndex((f) => f.id === feedbackId);

    if (index === -1) {
      console.warn(`Feedback ${feedbackId} not found for upvote toggle`);
      return null;
    }

    // Use pure toggle function
    const updatedFeedback = toggleUpvotePure(feedbacks[index], userId);

    // Update in place
    const updated = [...feedbacks];
    updated[index] = updatedFeedback;

    await saveFeedback(updated);
    return updatedFeedback;
  });
}

/**
 * @deprecated Use toggleFeedbackUpvote instead.
 * Kept for backwards compatibility during migration.
 */
export async function upvoteFeedback(id: string): Promise<void> {
  await toggleFeedbackUpvote(id);
}

// ============================================
// Reply operations
// ============================================

/**
 * Add a reply to a feedback item.
 * Atomic operation with mutex lock.
 *
 * @param feedbackId - The feedback to reply to
 * @param content - The reply text
 * @returns The updated feedback item with new reply, or null if feedback not found
 */
export async function addReply(
  feedbackId: string,
  content: string,
): Promise<Feedback | null> {
  const userId = getUserId();

  const newReply: Reply = {
    id: Crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    authorId: userId,
    upvotedBy: [],
  };

  return withFeedbackLock(async () => {
    const feedbacks = await getFeedback();
    const index = feedbacks.findIndex((f) => f.id === feedbackId);

    if (index === -1) {
      console.warn(`Feedback ${feedbackId} not found for reply`);
      return null;
    }

    // Use pure function to add reply
    const updatedFeedback = addReplyToFeedback(feedbacks[index], newReply);

    // Update in place
    const updated = [...feedbacks];
    updated[index] = updatedFeedback;

    await saveFeedback(updated);
    return updatedFeedback;
  });
}

/**
 * Toggle upvote on a reply within a feedback item.
 * Atomic operation with mutex lock.
 *
 * @param feedbackId - The parent feedback
 * @param replyId - The reply to toggle upvote on
 * @returns The updated feedback item, or null if not found
 */
export async function toggleReplyUpvote(
  feedbackId: string,
  replyId: string,
): Promise<Feedback | null> {
  const userId = getUserId();

  return withFeedbackLock(async () => {
    const feedbacks = await getFeedback();
    const index = feedbacks.findIndex((f) => f.id === feedbackId);

    if (index === -1) {
      console.warn(`Feedback ${feedbackId} not found for reply upvote`);
      return null;
    }

    // Verify reply exists
    const feedback = feedbacks[index];
    if (!feedback.replies.some((r) => r.id === replyId)) {
      console.warn(`Reply ${replyId} not found in feedback ${feedbackId}`);
      return null;
    }

    // Use pure function to toggle reply upvote
    const updatedFeedback = toggleReplyUpvotePure(feedback, replyId, userId);

    // Update in place
    const updated = [...feedbacks];
    updated[index] = updatedFeedback;

    await saveFeedback(updated);
    return updatedFeedback;
  });
}
