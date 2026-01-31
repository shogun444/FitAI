import { Card } from "@/components/ui";
import { NutritionResult } from "@/types";
import { Text, View } from "react-native";

interface NutritionResultCardProps {
  result: NutritionResult;
}

/**
 * Displays nutrition calculation results.
 * Shows BMI and protein recommendation range.
 */
export function NutritionResultCard({ result }: NutritionResultCardProps) {
  const { bmi, bmiCategory, proteinRange } = result;

  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-4">
        Your Results
      </Text>

      {/* BMI Section */}
      <View className="mb-5">
        <Text className="font-secondaryMedium text-gray-500 dark:text-gray-400 text-sm mb-1">
          BMI
        </Text>
        <View className="flex-row items-baseline">
          <Text className="font-primaryBold text-3xl text-gray-900 dark:text-white">
            {bmi}
          </Text>
          <Text className="font-secondary text-gray-500 dark:text-gray-400 text-base ml-2">
            ({bmiCategory})
          </Text>
        </View>
        <Text className="font-secondary text-gray-400 dark:text-gray-500 text-xs mt-2">
          BMI is a rough indicator and does not reflect muscle mass.
        </Text>
      </View>

      {/* Protein Section */}
      <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
        <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm mb-2">
          Daily Protein Recommendation
        </Text>
        <Text className="font-primaryBold text-2xl text-primary-600">
          {proteinRange.min}–{proteinRange.max}g
        </Text>
        <Text className="font-secondary text-gray-600 dark:text-gray-400 text-sm mt-2">
          Aim for {proteinRange.min}–{proteinRange.max} grams of protein per day
          to support your fitness goals.
        </Text>
      </View>
    </Card>
  );
}
