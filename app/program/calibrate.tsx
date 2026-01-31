import {
  CalibrationSummaryCard,
  LiftCalibrationCard,
} from "@/components/programs";
import { Button, Card, Heading, Subheading } from "@/components/ui";
import { calibrateLift } from "@/lib/programRules";
import { saveProgram } from "@/lib/programStorage";
import {
  CalibrationResult,
  LiftCalibration,
  PROGRAM_LIFTS,
  ProgramInstance,
  ProgramLiftId,
  ProgramLiftState,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Step = "input" | "summary";

export default function CalibrateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState<Step>("input");

  // Calibration inputs for each lift
  const [inputs, setInputs] = useState<Record<ProgramLiftId, LiftCalibration>>({
    "weighted-pullups": {
      liftId: "weighted-pullups",
      prWeight: 0,
      workingWeight: 0,
      canComplete5Reps: true,
    },
    "weighted-dips": {
      liftId: "weighted-dips",
      prWeight: 0,
      workingWeight: 0,
      canComplete5Reps: true,
    },
    squats: {
      liftId: "squats",
      prWeight: 0,
      workingWeight: 0,
      canComplete5Reps: true,
    },
  });

  // Calibration results after applying rules
  const [results, setResults] = useState<CalibrationResult[]>([]);

  const updateInput = useCallback(
    (
      liftId: ProgramLiftId,
      field: keyof Omit<LiftCalibration, "liftId">,
      value: number | boolean,
    ) => {
      setInputs((prev) => ({
        ...prev,
        [liftId]: {
          ...prev[liftId],
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleCalibrate = useCallback(() => {
    const calibrationResults = PROGRAM_LIFTS.map((lift) =>
      calibrateLift(inputs[lift.id]),
    );
    setResults(calibrationResults);
    setStep("summary");
  }, [inputs]);

  const handleConfirm = useCallback(async () => {
    // Create initial lift states from calibration results
    const lifts: ProgramLiftState[] = results.map((result) => ({
      liftId: result.liftId,
      currentWeight: result.startingWeight,
      lastPerformance: null,
    }));

    // Create program instance
    const program: ProgramInstance = {
      id: `instance-${Date.now()}`,
      programId: id || "weighted-calisthenics-5x5",
      startDate: Date.now(),
      sessionIndex: 1,
      lifts,
      frequency: 2,
      status: "active",
      history: [],
    };

    await saveProgram(program);
    router.replace("/(tabs)");
  }, [id, results]);

  const handleBack = useCallback(() => {
    if (step === "summary") {
      setStep("input");
    } else {
      router.back();
    }
  }, [step]);

  const isValid = PROGRAM_LIFTS.every(
    (lift) => inputs[lift.id].prWeight > 0 && inputs[lift.id].workingWeight > 0,
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="font-primaryBold text-lg text-gray-900 dark:text-white">
            {step === "input"
              ? "Calibrate Weights"
              : "Confirm Starting Weights"}
          </Text>
          <Text className="font-secondary text-sm text-gray-500 dark:text-gray-400">
            {step === "input" ? "Step 1 of 2" : "Step 2 of 2"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {step === "input" ? (
          <>
            <Heading className="mb-1">Enter Your Numbers</Heading>
            <Subheading className="mb-6">
              We'll use these to calculate safe starting weights for your
              program.
            </Subheading>

            {/* Info card */}
            <Card className="mb-6 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
              <View className="flex-row">
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#65a30d"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="font-secondaryMedium text-primary-700 dark:text-primary-300 text-sm">
                    PR = Your all-time best for 1 rep
                  </Text>
                  <Text className="font-secondary text-primary-600 dark:text-primary-400 text-xs mt-1">
                    Working weight = What you'd use for 5 comfortable reps today
                  </Text>
                </View>
              </View>
            </Card>

            {/* Lift calibration cards */}
            {PROGRAM_LIFTS.map((lift) => (
              <LiftCalibrationCard
                key={lift.id}
                lift={lift}
                prWeight={inputs[lift.id].prWeight}
                workingWeight={inputs[lift.id].workingWeight}
                canComplete5Reps={inputs[lift.id].canComplete5Reps}
                onPRChange={(val) => updateInput(lift.id, "prWeight", val)}
                onWorkingWeightChange={(val) =>
                  updateInput(lift.id, "workingWeight", val)
                }
                onCanComplete5RepsChange={(val) =>
                  updateInput(lift.id, "canComplete5Reps", val)
                }
              />
            ))}
          </>
        ) : (
          <>
            <Heading className="mb-1">Review & Confirm</Heading>
            <Subheading className="mb-6">
              We've applied safety adjustments where needed.
            </Subheading>

            <CalibrationSummaryCard results={results} />

            {/* Conservative start info */}
            <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <View className="flex-row">
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="#65a30d"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm">
                    Starting conservatively improves long-term progress
                  </Text>
                  <Text className="font-secondary text-gray-500 dark:text-gray-400 text-xs mt-1">
                    You'll progress quickly if these weights feel easy.
                  </Text>
                </View>
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        {step === "input" ? (
          <Button
            title="Calculate Starting Weights"
            onPress={handleCalibrate}
            disabled={!isValid}
            className={!isValid ? "opacity-50" : ""}
          />
        ) : (
          <Button title="Start Program" onPress={handleConfirm} />
        )}
      </View>
    </SafeAreaView>
  );
}
