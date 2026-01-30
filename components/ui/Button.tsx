import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "rounded-xl py-4 px-6 active:opacity-80";
  const disabledStyles = disabled ? "opacity-50" : "";

  const variantStyles = {
    primary: "bg-primary",
    secondary: "border border-gray-200 dark:border-gray-800 bg-surface dark:bg-surface-dark",
  };

  const textStyles = {
    primary: "font-secondaryMedium text-background-dark text-center text-base",
    secondary: "font-secondaryMedium text-gray-900 dark:text-white text-center text-base",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      <Text className={textStyles[variant]}>{title}</Text>
    </Pressable>
  );
}
