import { Text } from "react-native";

type BodyTextProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Body text component using Inter font.
 * Use for descriptions, instructions, and general content.
 *
 * Typography Rules:
 * - Font: Inter (font-secondary)
 * - Default: Regular weight, base size
 */
export function BodyText({ children, className = "" }: BodyTextProps) {
  return (
    <Text
      className={`font-secondary text-base text-gray-600 dark:text-gray-400 ${className}`}
    >
      {children}
    </Text>
  );
}
