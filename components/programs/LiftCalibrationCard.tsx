import { Card, NumberInput } from "@/components/ui";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ProgramLift } from "@/types";
import { Text, View } from "react-native";

interface LiftCalibrationCardProps {
  lift: ProgramLift;
  prWeight: number;
  workingWeight: number;
  canComplete5Reps: boolean;
  onPRChange: (value: number) => void;
  onWorkingWeightChange: (value: number) => void;
  onCanComplete5RepsChange: (value: boolean) => void;
}

/**
 * Calibration input card for a single lift.
 * Collects: PR, working weight, and 5-rep capability.
 */
export function LiftCalibrationCard({
  lift,
  prWeight,
  workingWeight,
  canComplete5Reps,
  onPRChange,
  onWorkingWeightChange,
  onCanComplete5RepsChange,
}: LiftCalibrationCardProps) {
  // Convert number to string for display, handling 0 as empty
  const prWeightStr = prWeight === 0 ? "" : String(prWeight);
  const workingWeightStr = workingWeight === 0 ? "" : String(workingWeight);

  // Parse string input to number
  const handlePRChange = (text: string) => {
    const num = parseFloat(text) || 0;
    onPRChange(num);
  };

  const handleWorkingWeightChange = (text: string) => {
    const num = parseFloat(text) || 0;
    onWorkingWeightChange(num);
  };

  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-xl text-gray-900 dark:text-white mb-1">
        {lift.name}
      </Text>
      <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-5">
        {lift.description}
      </Text>

      <View className="gap-4">
        <NumberInput
          label="Highest PR (kg)"
          value={prWeightStr}
          onChangeText={handlePRChange}
          placeholder="e.g. 40"
          unit="kg"
        />
        <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs -mt-2">
          Your best successful weight, even if it was months ago.
        </Text>

        <NumberInput
          label="Current Working Weight (kg)"
          value={workingWeightStr}
          onChangeText={handleWorkingWeightChange}
          placeholder="e.g. 30"
          unit="kg"
        />
        <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs -mt-2">
          Weight you can confidently use today.
        </Text>

        <ToggleSwitch
          label="Can you complete 5 reps at this weight?"
          value={canComplete5Reps}
          onChange={onCanComplete5RepsChange}
          className="mt-2"
        />
      </View>
    </Card>
  );
}
