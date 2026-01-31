import { Text, TextInput, View } from "react-native";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  className?: string;
}

/**
 * Reusable number input with label and optional unit suffix.
 * Accepts string value to handle empty states properly.
 */
export function NumberInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  className = "",
}: NumberInputProps) {
  return (
    <View className={className}>
      <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-2">
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          className="flex-1 font-secondary bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
        />
        {unit && (
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-base ml-3">
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
