import { Text } from "react-native";

type HeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function Heading({ children, className = "" }: HeadingProps) {
  return (
    <Text
      className={`font-primaryBold text-3xl text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </Text>
  );
}
