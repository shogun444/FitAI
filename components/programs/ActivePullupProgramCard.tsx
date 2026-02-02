import { Card } from "@/components/ui";
import {
  PULLUP_PROGRAM,
  PULLUP_PROGRAM_EXERCISES,
} from "@/data/pullup-program";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface ActivePullupProgramCardProps {
  /** Number of completed sessions */
  completedSessions: number;
  /** Target number of sessions to complete */
  targetSessions: number;
  /** Whether there's an active session in progress */
  hasActiveSession: boolean;
}

/**
 * Displays active pull-up program status on home screen.
 *
 * Visual pattern matches ActiveProgramCard for consistency.
 * Used when user has started the "Unlock Your First Pull-up" program.
 */
export function ActivePullupProgramCard({
  completedSessions,
  targetSessions,
  hasActiveSession,
}: ActivePullupProgramCardProps) {
  const progressPercent = Math.min(
    (completedSessions / targetSessions) * 100,
    100,
  );

  const handlePress = () => {
    router.push("/pullup-program");
  };

  const handleContinueSession = () => {
    router.push("/pullup-program/session");
  };

  return (
    <Card className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
            <Ionicons name="fitness" size={20} color="#65a30d" />
          </View>
          <View>
            <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
              {PULLUP_PROGRAM.name}
            </Text>
            <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
              Session {completedSessions + 1} of {targetSessions}
            </Text>
          </View>
        </View>
        <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full">
          <Text className="font-secondaryMedium text-primary-600 text-xs">
            FREE
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400">
            Program Progress
          </Text>
          <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400">
            {completedSessions}/{targetSessions} sessions
          </Text>
        </View>
        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      {/* Exercises preview */}
      <View className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
        <Text className="font-secondaryMedium text-sm text-gray-700 dark:text-gray-300 mb-2">
          Exercises Per Session
        </Text>
        {PULLUP_PROGRAM_EXERCISES.map((exercise) => (
          <View
            key={exercise.id}
            className="flex-row items-center justify-between py-1.5"
          >
            <Text className="font-secondary text-sm text-gray-600 dark:text-gray-400">
              {exercise.name}
            </Text>
            <Text className="font-secondaryMedium text-sm text-gray-900 dark:text-white">
              {exercise.setsPerSession} sets × {exercise.targetValue}{" "}
              {exercise.targetUnit}
            </Text>
          </View>
        ))}
      </View>

      {/* Action button - Show Continue or Start based on session state */}
      {hasActiveSession ? (
        <TouchableOpacity
          onPress={handleContinueSession}
          className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center"
        >
          <Ionicons
            name="play-forward"
            size={18}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="font-primarySemiBold text-white text-base">
            Continue Session
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center"
        >
          <Ionicons
            name="play"
            size={18}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="font-primarySemiBold text-white text-base">
            Start Next Session
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
