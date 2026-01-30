import { View } from "react-native";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`bg-surface dark:bg-surface-dark rounded-xl p-5 ${className}`}
    >
      {children}
    </View>
  );
}
