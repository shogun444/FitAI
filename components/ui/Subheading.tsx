import { Text } from "react-native";

type SubheadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function Subheading({ children, className = "" }: SubheadingProps) {
  return (
    <Text
      className={`font-secondaryMedium text-base text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </Text>
  );
}
