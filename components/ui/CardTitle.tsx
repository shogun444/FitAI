import { Text } from "react-native";

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Card title component using Manrope font.
 * Use for titles within cards, list item headers, and smaller headings.
 *
 * Typography Rules:
 * - Font: Manrope (font-primary family)
 * - Default: SemiBold weight, lg size
 */
export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <Text
      className={`font-primarySemiBold text-lg text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </Text>
  );
}
