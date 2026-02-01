import { Button, Card } from "@/components/ui";
import { Modal, Text, View } from "react-native";

/**
 * Cancel Workout Modal
 *
 * Confirms that the user wants to cancel their current workout session.
 * Used for both free and paid workout sessions.
 *
 * Design matches SessionConflictModal for UI consistency.
 */

interface CancelWorkoutModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when user wants to keep working */
  onKeepWorking: () => void;
  /** Called when user confirms cancellation */
  onConfirmCancel: () => void;
}

export function CancelWorkoutModal({
  visible,
  onKeepWorking,
  onConfirmCancel,
}: CancelWorkoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeepWorking}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <Card className="w-full max-w-sm">
          {/* Title */}
          <Text className="font-primaryBold text-xl text-gray-900 dark:text-white mb-3">
            Cancel Workout?
          </Text>

          {/* Message */}
          <Text className="font-secondary text-gray-600 dark:text-gray-400 mb-6 leading-6">
            This will discard all progress for this session.{"\n\n"}
            Are you sure you want to cancel?
          </Text>

          {/* Actions */}
          <View className="gap-3">
            <Button
              title="No, keep working"
              onPress={onKeepWorking}
              variant="secondary"
            />
            <Button
              title="Yes, cancel workout"
              onPress={onConfirmCancel}
              variant="danger"
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}
