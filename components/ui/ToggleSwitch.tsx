import { Pressable, Text, View } from "react-native";

interface ToggleSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

/**
 * Reusable toggle switch with label.
 * Simple YES/NO style toggle.
 */
export function ToggleSwitch({
  label,
  value,
  onChange,
  className = "",
}: ToggleSwitchProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text className="font-secondary text-gray-700 dark:text-gray-300 text-base flex-1 mr-4">
        {label}
      </Text>
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <Pressable
          onPress={() => onChange(false)}
          className={`px-4 py-2 rounded-lg ${
            !value ? "bg-white dark:bg-gray-700" : ""
          }`}
        >
          <Text
            className={`font-secondaryMedium text-sm ${
              !value
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            No
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange(true)}
          className={`px-4 py-2 rounded-lg ${value ? "bg-primary" : ""}`}
        >
          <Text
            className={`font-secondaryMedium text-sm ${
              value
                ? "text-background-dark"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Yes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
