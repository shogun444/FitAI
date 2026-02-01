import { Text } from "react-native";

type WorkoutStatProps = {
  children: React.ReactNode;
  className?: string;
  /** Size variant for the stat */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "5xl" | "6xl";
  /** Weight variant */
  weight?: "normal" | "medium" | "semibold";
};

/**
 * Workout stat/number component using Inter font.
 * Use for weights, reps, sets, timers, and all numeric workout data.
 *
 * Typography Rules:
 * - Font: Inter (font-secondary family)
 * - Use for: "30kg × 5", timer displays, set counts, stats
 * - NEVER use Manrope for workout numbers
 *
 * Examples:
 * - Timer: <WorkoutStat size="6xl" weight="semibold">02:30</WorkoutStat>
 * - Weight: <WorkoutStat weight="medium">30 kg</WorkoutStat>
 * - Reps: <WorkoutStat size="lg" weight="semibold">5</WorkoutStat>
 */
export function WorkoutStat({
  children,
  className = "",
  size = "base",
  weight = "normal",
}: WorkoutStatProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  };

  const weightClasses = {
    normal: "font-secondary",
    medium: "font-secondaryMedium",
    semibold: "font-secondarySemiBold",
  };

  return (
    <Text
      className={`${weightClasses[weight]} ${sizeClasses[size]} text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </Text>
  );
}
