import { useCallback, useState } from "react";
import { ActiveSessionType, useSessionGuard } from "./useSessionGuard";

/**
 * Session Guard with Confirmation Hook
 *
 * Provides a complete flow for guarding against concurrent sessions
 * with user confirmation.
 *
 * Usage:
 * ```tsx
 * const { guardedStartWorkout, modalProps } = useSessionGuardWithConfirmation();
 *
 * // When user wants to start a workout:
 * guardedStartWorkout(() => {
 *   // This callback runs only if:
 *   // 1. No active session exists, OR
 *   // 2. User confirmed canceling the active session
 *   startWorkout();
 *   addExercise(...);
 *   router.push('/workout/session');
 * });
 *
 * // In your render:
 * <SessionConflictModal {...modalProps} />
 * ```
 */

export interface SessionGuardModalProps {
  visible: boolean;
  activeSessionType: ActiveSessionType;
  onContinueCurrent: () => void;
  onCancelAndStartNew: () => void;
}

export interface SessionGuardWithConfirmationResult {
  /** Call this when user attempts to start a new workout */
  guardedStartWorkout: (onStart: () => void | Promise<void>) => void;
  /** Props to spread to SessionConflictModal */
  modalProps: SessionGuardModalProps;
  /** Whether a session (free or program) is currently active */
  hasActiveSession: boolean;
  /** Type of active session */
  activeSessionType: ActiveSessionType;
}

export function useSessionGuardWithConfirmation(): SessionGuardWithConfirmationResult {
  const { hasActiveSession, activeSessionType, cancelActiveSession } =
    useSessionGuard();

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => void | Promise<void>) | null
  >(null);

  /**
   * Attempt to start a new workout.
   * If a session is active, shows confirmation modal instead of executing immediately.
   */
  const guardedStartWorkout = useCallback(
    (onStart: () => void | Promise<void>) => {
      if (hasActiveSession) {
        // Store the action to execute after confirmation
        setPendingAction(() => onStart);
        setModalVisible(true);
      } else {
        // No active session, proceed immediately
        onStart();
      }
    },
    [hasActiveSession],
  );

  /**
   * User chose to continue their current workout.
   * Dismiss modal and do nothing.
   */
  const handleContinueCurrent = useCallback(() => {
    setModalVisible(false);
    setPendingAction(null);
  }, []);

  /**
   * User confirmed they want to cancel current and start new.
   * Cancel the active session and execute the pending action.
   */
  const handleCancelAndStartNew = useCallback(async () => {
    // Cancel the active session first
    await cancelActiveSession();

    // Close the modal
    setModalVisible(false);

    // Execute the pending action
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  }, [cancelActiveSession, pendingAction]);

  return {
    guardedStartWorkout,
    modalProps: {
      visible: modalVisible,
      activeSessionType,
      onContinueCurrent: handleContinueCurrent,
      onCancelAndStartNew: handleCancelAndStartNew,
    },
    hasActiveSession,
    activeSessionType,
  };
}
