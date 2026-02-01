import { Text } from "react-native";

type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Section title component using Manrope font.
 * Use for section headers within screens.
 *
 * Typography Rules:
 * - Font: Manrope (font-primary family)
 * - Default: SemiBold weight, lg size
 */
export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <Text
      className={`font-primarySemiBold text-lg text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </Text>
  );
}
