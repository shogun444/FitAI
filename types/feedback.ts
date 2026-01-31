/**
 * Reply to a feedback item.
 *
 * STRICT CONSTRAINT: Replies are ONE LEVEL DEEP only.
 * - Replies CANNOT have replies (no nested threads)
 * - No `replies` field on this type by design
 * - Upvotes use the same userId array pattern as Feedback
 */
export interface Reply {
  id: string;
  content: string;
  createdAt: number;
  authorId: string; // userId of who created this reply
  upvotedBy: string[]; // Array of userIds who upvoted (source of truth)
}

/**
 * Feedback item with upvote tracking and replies.
 *
 * Architecture decisions:
 * - `upvotedBy` is an array of userIds (not a Set) because:
 *   1. JSON-serializable for AsyncStorage
 *   2. Simple toggle: includes() + filter()/push()
 *   3. Count is derived: upvotedBy.length (never stored separately)
 *
 * - No `upvotes: number` field to prevent derived state bugs
 * - authorId tracks who created the feedback
 * - replies is an array of Reply objects (ONE LEVEL DEEP only)
 */
export interface Feedback {
  id: string;
  content: string;
  createdAt: number;
  authorId: string; // userId of who created this feedback
  upvotedBy: string[]; // Array of userIds who upvoted (source of truth)
  replies: Reply[]; // ONE LEVEL DEEP - replies cannot have replies
}

export type FeedbackSortMode = "latest" | "oldest" | "upvotes";

// ============================================
// Upvotable interface for shared logic
// ============================================

/**
 * Common interface for items that can be upvoted.
 * Used by both Feedback and Reply.
 */
export interface Upvotable {
  upvotedBy: string[];
}

// ============================================
// Pure, deterministic upvote logic
// ============================================

/**
 * Toggle upvote for any upvotable item (Feedback or Reply).
 * Pure function: same input → same output, no side effects.
 *
 * @param item - The item to toggle (Feedback or Reply)
 * @param userId - The user performing the action
 * @returns New object with updated upvotedBy array
 */
export function toggleUpvote<T extends Upvotable>(item: T, userId: string): T {
  const hasUpvoted = item.upvotedBy.includes(userId);

  return {
    ...item,
    upvotedBy: hasUpvoted
      ? item.upvotedBy.filter((id) => id !== userId) // Remove upvote
      : [...item.upvotedBy, userId], // Add upvote
  };
}

/**
 * Check if a user has upvoted an item.
 * Derive from source of truth, never store separately.
 */
export function hasUserUpvoted(item: Upvotable, userId: string): boolean {
  return item.upvotedBy.includes(userId);
}

/**
 * Get upvote count for an item.
 * Always derived from upvotedBy.length, never stored.
 */
export function getUpvoteCount(item: Upvotable): number {
  return item.upvotedBy.length;
}

/**
 * Create a new feedback item with proper initialization.
 * Ensures upvotedBy and replies are always valid arrays.
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
    replies: [], // Always start with empty array
  };
}

/**
 * Create a new reply with proper initialization.
 * Note: No replies field - replies cannot have replies.
 */
export function createReply(
  content: string,
  authorId: string,
): Omit<Reply, "id"> {
  return {
    content,
    createdAt: Date.now(),
    authorId,
    upvotedBy: [], // Always start with empty array
  };
}

/**
 * Add a reply to a feedback item.
 * Pure function - returns new feedback with reply added.
 * Replies are stored in chronological order (oldest first).
 */
export function addReplyToFeedback(feedback: Feedback, reply: Reply): Feedback {
  return {
    ...feedback,
    replies: [...feedback.replies, reply], // Append to end (chronological)
  };
}

/**
 * Toggle upvote on a reply within a feedback item.
 * Pure function - returns new feedback with updated reply.
 */
export function toggleReplyUpvote(
  feedback: Feedback,
  replyId: string,
  userId: string,
): Feedback {
  return {
    ...feedback,
    replies: feedback.replies.map((reply) =>
      reply.id === replyId ? toggleUpvote(reply, userId) : reply,
    ),
  };
}

/**
 * Get reply count for a feedback item.
 */
export function getReplyCount(feedback: Feedback): number {
  return feedback.replies.length;
}

/**
 * Sanitize a reply loaded from storage.
 * Handles corrupted or missing data.
 */
export function sanitizeReply(data: unknown): Reply | null {
  if (!data || typeof data !== "object") return null;

  const item = data as Record<string, unknown>;

  // Required fields validation
  if (typeof item.id !== "string" || !item.id) return null;
  if (typeof item.content !== "string") return null;
  if (typeof item.createdAt !== "number") return null;

  // Sanitize upvotedBy: ensure it's an array of unique strings
  let upvotedBy: string[] = [];
  if (Array.isArray(item.upvotedBy)) {
    const seen = new Set<string>();
    upvotedBy = item.upvotedBy.filter((id): id is string => {
      if (typeof id === "string" && id && !seen.has(id)) {
        seen.add(id);
        return true;
      }
      return false;
    });
  }

  return {
    id: item.id,
    content: item.content,
    createdAt: item.createdAt,
    authorId: typeof item.authorId === "string" ? item.authorId : "unknown",
    upvotedBy,
  };
}

/**
 * Sanitize feedback data loaded from storage.
 * Handles corrupted or missing upvotedBy and replies data.
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

  // Sanitize replies: ensure it's an array of valid Reply objects
  let replies: Reply[] = [];
  if (Array.isArray(item.replies)) {
    replies = item.replies
      .map((r) => sanitizeReply(r))
      .filter((r): r is Reply => r !== null);
  }

  // Handle legacy data: if upvotedBy missing but upvotes exists, initialize empty
  // (we can't recover who upvoted, so start fresh)

  return {
    id: item.id,
    content: item.content,
    createdAt: item.createdAt,
    authorId: typeof item.authorId === "string" ? item.authorId : "unknown",
    upvotedBy,
    replies,
  };
}
