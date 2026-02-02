import { Text, TextInput, View } from "react-native";

interface SetInputProps {
  /** Current input value as string */
  value: string;
  /** Callback when value changes */
  onChangeText: (text: string) => void;
  /** Current set number (1-based for display) */
  currentSet: number;
  /** Input type: "reps" or "time" */
  inputType: "reps" | "time";
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * Input field for entering set value (reps or time).
 * Shows the current set number and appropriate label.
 *
 * Usage:
 * ```tsx
 * <SetInput
 *   value={inputValue}
 *   onChangeText={handleInputChange}
 *   currentSet={1}
 *   inputType="reps"
 * />
 * ```
 */
export function SetInput({
  value,
  onChangeText,
  currentSet,
  inputType,
  placeholder = "0",
}: SetInputProps) {
  const isTimeInput = inputType === "time";
  const label = isTimeInput
    ? "How long did you hold? (seconds)"
    : "How many reps did you complete?";
  const unit = isTimeInput ? "seconds" : "reps";

  return (
    <View className="mb-4">
      <Text className="font-secondaryMedium text-gray-600 dark:text-gray-400 mb-2 text-center">
        Set {currentSet}: {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-center font-secondarySemiBold text-3xl text-gray-900 dark:text-white"
        selectTextOnFocus
      />
      <Text className="font-secondary text-gray-400 text-center mt-1">
        {unit}
      </Text>
    </View>
  );
}
