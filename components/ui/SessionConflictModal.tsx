import { Button, Card } from "@/components/ui";
import { ActiveSessionType } from "@/hooks/useSessionGuard";
import { Modal, Text, View } from "react-native";

/**
 * Session Conflict Modal
 *
 * Prompts the user when they attempt to start a new workout
 * while another session is already active.
 *
 * STRICT UI COPY:
 * - Title: "Workout in progress"
 * - Message explains the consequence of proceeding
 * - Two clear action buttons
 */

interface SessionConflictModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Type of the currently active session for context-aware messaging */
  activeSessionType: ActiveSessionType;
  /** Called when user wants to continue their current workout */
  onContinueCurrent: () => void;
  /** Called when user confirms they want to cancel current and start new */
  onCancelAndStartNew: () => void;
}

export function SessionConflictModal({
  visible,
  activeSessionType,
  onContinueCurrent,
  onCancelAndStartNew,
}: SessionConflictModalProps) {
  // Context-aware session label
  const sessionLabel =
    activeSessionType === "program" ? "program session" : "workout session";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinueCurrent}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <Card className="w-full max-w-sm">
          {/* Title */}
          <Text className="font-primaryBold text-xl text-gray-900 dark:text-white mb-3">
            Workout in progress
          </Text>

          {/* Message */}
          <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-6 leading-6">
            You already have an active {sessionLabel}.{"\n\n"}
            Starting a new workout will cancel the current session and discard
            all progress.
          </Text>

          {/* Actions */}
          <View className="gap-3">
            <Button
              title="No, continue current workout"
              onPress={onContinueCurrent}
              variant="secondary"
            />
            <Button
              title="Yes, cancel & start new workout"
              onPress={onCancelAndStartNew}
              variant="danger"
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}
