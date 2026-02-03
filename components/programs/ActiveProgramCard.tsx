import { Card, SessionConflictModal } from "@/components/ui";
import { useProgramInstance } from "@/hooks/useProgramInstance";
import { useSessionGuardWithConfirmation } from "@/hooks/useSessionGuardWithConfirmation";
import { PROGRAM_LIFTS, ProgramInstance, ProgramSession } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { ProgressionBadge } from "./ProgressionBadge";

interface ActiveProgramCardProps {
  program: ProgramInstance;
  todaySession: ProgramSession;
}

/**
 * Compute total weight gained from last session.
 * Returns delta sum across all lifts that had lastPerformance.
 */
function getLastSessionGains(program: ProgramInstance): {
  totalDelta: number;
  hasData: boolean;
} {
  let totalDelta = 0;
  let hasData = false;

  for (const lift of program.lifts) {
    if (lift.lastPerformance) {
      hasData = true;
      const delta =
        lift.lastPerformance.nextWeight - lift.lastPerformance.weight;
      totalDelta += delta;
    }
  }

  return { totalDelta, hasData };
}

/**
 * Displays active program status and today's workout on home screen.
 */
export function ActiveProgramCard({
  program,
  todaySession,
}: ActiveProgramCardProps) {
  const { guardedStartWorkout, modalProps } = useSessionGuardWithConfirmation();
  const { startSession, hasSessionInProgress } = useProgramInstance();

  // Check if there's a session in progress
  const isSessionInProgress = hasSessionInProgress;

  const handleStartSession = () => {
    // Guard against active free workout session
    guardedStartWorkout(async () => {
      // Only start a new session if not already in progress
      if (!isSessionInProgress) {
        await startSession();
      }
      router.push("/program/session");
    });
  };

  const handleContinueSession = () => {
    // No guard needed - just resume the existing session
    router.push("/program/session");
  };

  const totalWeeks = 12;
  const currentWeek = Math.ceil(program.sessionIndex / 2);
  const progressPercent = Math.min((currentWeek / totalWeeks) * 100, 100);

  // Get last session progression data
  const { totalDelta, hasData } = getLastSessionGains(program);

  return (
    <>
      {/* Session Conflict Modal */}
      <SessionConflictModal {...modalProps} />

      <Card className="mb-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
              <Ionicons name="barbell" size={20} color="#65a30d" />
            </View>
            <View>
              <Text className="font-primarySemiBold text-base text-gray-900 dark:text-white">
                Weighted Calisthenics 5×5
              </Text>
              <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
                Week {currentWeek} • Session {program.sessionIndex}
              </Text>
            </View>
          </View>
          <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full">
            <Text className="font-secondaryMedium text-primary-600 text-xs">
              Active
            </Text>
          </View>
        </View>

        {/* Last session gains - show only if not first session */}
        {hasData && (
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2.5 mb-3">
            <Ionicons
              name="trending-up"
              size={16}
              color={totalDelta > 0 ? "#65a30d" : "#6b7280"}
              style={{ marginRight: 8 }}
            />
            <Text className="font-secondary text-sm text-gray-600 dark:text-gray-400 flex-1">
              Last session:
            </Text>
            {totalDelta > 0 ? (
              <Text className="font-secondaryMedium text-sm text-primary-600">
                +{totalDelta} kg added
              </Text>
            ) : (
              <Text className="font-secondaryMedium text-sm text-gray-500 dark:text-gray-400">
                Weights maintained
              </Text>
            )}
          </View>
        )}

        {/* Progress bar */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400">
              Program Progress
            </Text>
            <Text className="font-secondary text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        {/* Today's lifts preview with individual gains */}
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
          <Text className="font-secondaryMedium text-sm text-gray-700 dark:text-gray-300 mb-2">
            Today's Workout
          </Text>
          {todaySession.lifts.map((lift) => {
            const liftInfo = PROGRAM_LIFTS.find((l) => l.id === lift.liftId)!;
            const liftState = program.lifts.find(
              (l) => l.liftId === lift.liftId,
            );
            const lastPerf = liftState?.lastPerformance;
            const liftDelta = lastPerf
              ? lastPerf.nextWeight - lastPerf.weight
              : 0;

            return (
              <View
                key={lift.liftId}
                className="flex-row items-center justify-between py-1.5"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="font-secondary text-sm text-gray-600 dark:text-gray-400">
                    {liftInfo.name}
                  </Text>
                  {/* Show per-lift gain badge if there was progression */}
                  {lastPerf && liftDelta !== 0 && (
                    <ProgressionBadge delta={liftDelta} className="ml-2" />
                  )}
                </View>
                <Text className="font-secondaryMedium text-sm text-gray-900 dark:text-white">
                  {lift.weight} kg × {lift.reps} × {lift.sets}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action button - Show Continue or Start based on session state */}
        {isSessionInProgress ? (
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
            <Text className="font-secondaryMedium text-white text-base">
              Continue Workout
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleStartSession}
            className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons
              name="play"
              size={18}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="font-secondaryMedium text-white text-base">
              Start Session
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    </>
  );
}
