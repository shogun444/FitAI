import { Button } from "@/components/ui";
import { View } from "react-native";

interface SessionActionsProps {
  /** Whether this is the last set */
  isLastSet: boolean;
  /** Whether the action button should be enabled */
  canProceed: boolean;
  /** Callback for "Next Set" button */
  onNextSet: () => void;
  /** Callback for "Complete Session" button */
  onComplete: () => void;
  /** Callback for "Cancel" button */
  onCancel: () => void;
}

/**
 * Session action buttons (Next Set / Complete Session + Cancel).
 *
 * Button logic:
 * - If NOT last set: Shows "Next Set"
 * - If last set: Shows "Complete Session"
 *
 * Usage:
 * ```tsx
 * <SessionActions
 *   isLastSet={false}
 *   canProceed={true}
 *   onNextSet={handleNextSet}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function SessionActions({
  isLastSet,
  canProceed,
  onNextSet,
  onComplete,
  onCancel,
}: SessionActionsProps) {
  return (
    <View>
      {/* Primary Action Button */}
      {isLastSet ? (
        <Button
          title="Complete Session"
          onPress={onComplete}
          disabled={!canProceed}
        />
      ) : (
        <Button title="Next Set" onPress={onNextSet} disabled={!canProceed} />
      )}

      {/* Cancel Button */}
      <Button
        title="Cancel"
        variant="secondary"
        onPress={onCancel}
        className="mt-3"
      />
    </View>
  );
}
