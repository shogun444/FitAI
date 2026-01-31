/**
 * Feedback item with upvote tracking.
 *
 * Architecture decisions:
 * - `upvotedBy` is an array of userIds (not a Set) because:
 *   1. JSON-serializable for AsyncStorage
 *   2. Simple toggle: includes() + filter()/push()
 *   3. Count is derived: upvotedBy.length (never stored separately)
 *
 * - No `upvotes: number` field to prevent derived state bugs
 * - authorId tracks who created the feedback
 */
export interface Feedback {
  id: string;
  content: string;
  createdAt: number;
  authorId: string; // userId of who created this feedback
  upvotedBy: string[]; // Array of userIds who upvoted (source of truth)
}

export type FeedbackSortMode = "latest" | "oldest" | "upvotes";

// ============================================
// Pure, deterministic upvote logic
// ============================================

/**
 * Toggle upvote for a feedback item.
 * Pure function: same input → same output, no side effects.
 *
 * @param feedback - The feedback item to toggle
 * @param userId - The user performing the action
 * @returns New feedback object with updated upvotedBy array
 */
export function toggleUpvote(feedback: Feedback, userId: string): Feedback {
  const hasUpvoted = feedback.upvotedBy.includes(userId);

  return {
    ...feedback,
    upvotedBy: hasUpvoted
      ? feedback.upvotedBy.filter((id) => id !== userId) // Remove upvote
      : [...feedback.upvotedBy, userId], // Add upvote
  };
}

/**
 * Check if a user has upvoted a feedback item.
 * Derive from source of truth, never store separately.
 */
export function hasUserUpvoted(feedback: Feedback, userId: string): boolean {
  return feedback.upvotedBy.includes(userId);
}

/**
 * Get upvote count for a feedback item.
 * Always derived from upvotedBy.length, never stored.
 */
export function getUpvoteCount(feedback: Feedback): number {
  return feedback.upvotedBy.length;
}

/**
 * Create a new feedback item with proper initialization.
 * Ensures upvotedBy is always a valid array.
 */
export function createFeedback(
  content: string,
  authorId: string,
): Omit<Feedback, "id"> {
  return {
    content,
    createdAt: Date.now(),
    authorId,
    upvotedBy: [], // Always start with empty array
  };
}

/**
 * Sanitize feedback data loaded from storage.
 * Handles corrupted or missing upvotedBy data.
 * Ensures data integrity after app restarts.
 */
export function sanitizeFeedback(data: unknown): Feedback | null {
  if (!data || typeof data !== "object") return null;

  const item = data as Record<string, unknown>;

  // Required fields validation
  if (typeof item.id !== "string" || !item.id) return null;
  if (typeof item.content !== "string") return null;
  if (typeof item.createdAt !== "number") return null;

  // Sanitize upvotedBy: ensure it's an array of strings
  let upvotedBy: string[] = [];
  if (Array.isArray(item.upvotedBy)) {
    // Filter to only valid string userIds, remove duplicates
    const seen = new Set<string>();
    upvotedBy = item.upvotedBy.filter((id): id is string => {
      if (typeof id === "string" && id && !seen.has(id)) {
        seen.add(id);
        return true;
      }
      return false;
    });
  }

  // Handle legacy data: if upvotedBy missing but upvotes exists, initialize empty
  // (we can't recover who upvoted, so start fresh)

  return {
    id: item.id,
    content: item.content,
    createdAt: item.createdAt,
    authorId: typeof item.authorId === "string" ? item.authorId : "unknown",
    upvotedBy,
  };
}
