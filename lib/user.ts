/**
 * Local User Identity Management
 *
 * Architecture:
 * - userId is generated once and persisted forever
 * - Uses Crypto.randomUUID() for collision-free IDs
 * - Cached in memory after first load for O(1) access
 * - No authentication required
 *
 * Edge cases handled:
 * - First app launch: generate and persist
 * - Subsequent launches: load from storage
 * - Corrupted storage: regenerate (user loses upvote history)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const USER_ID_KEY = "fitai_user_id";

// In-memory cache for fast synchronous access after initialization
let cachedUserId: string | null = null;

/**
 * Initialize user ID on app startup.
 * Call this once in app _layout.tsx before rendering feedback screens.
 * Returns the userId for immediate use.
 */
export async function initializeUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  try {
    const stored = await AsyncStorage.getItem(USER_ID_KEY);

    if (stored && typeof stored === "string" && stored.length > 0) {
      cachedUserId = stored;
      return stored;
    }

    // First launch or corrupted data: generate new ID
    const newUserId = generateUserId();
    await AsyncStorage.setItem(USER_ID_KEY, newUserId);
    cachedUserId = newUserId;
    return newUserId;
  } catch (error) {
    // Storage failed: generate ID but don't persist
    // User will get new ID on next launch (acceptable degradation)
    console.error("Failed to initialize userId:", error);
    const fallbackId = generateUserId();
    cachedUserId = fallbackId;
    return fallbackId;
  }
}

/**
 * Get userId synchronously.
 * MUST call initializeUserId() first during app startup.
 * Throws if called before initialization.
 */
export function getUserId(): string {
  if (!cachedUserId) {
    throw new Error(
      "getUserId() called before initializeUserId(). " +
        "Call initializeUserId() in app startup.",
    );
  }
  return cachedUserId;
}

/**
 * Check if userId has been initialized.
 * Use this to guard synchronous access.
 */
export function isUserIdInitialized(): boolean {
  return cachedUserId !== null;
}

/**
 * Generate a new UUID.
 * Uses Expo's Crypto.randomUUID() which is available in Expo SDK.
 */
function generateUserId(): string {
  // Crypto.randomUUID() is available globally in Expo/React Native
  return Crypto.randomUUID();
}

/**
 * For testing/debugging only: reset userId.
 * Do NOT use in production code.
 */
export async function __resetUserId(): Promise<void> {
  cachedUserId = null;
  await AsyncStorage.removeItem(USER_ID_KEY);
}
