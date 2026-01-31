import { Pressable, Text, View } from "react-native";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectGroupProps<T extends string> {
  label: string;
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Reusable single-select button group.
 * Horizontal layout with pill-style buttons.
 */
export function SelectGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className = "",
}: SelectGroupProps<T>) {
  return (
    <View className={className}>
      <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-2">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`px-4 py-2.5 rounded-xl ${
                isSelected
                  ? "bg-primary"
                  : "bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
              }`}
            >
              <Text
                className={`font-secondaryMedium text-sm ${
                  isSelected
                    ? "text-background-dark"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
