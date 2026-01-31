import { Card } from "@/components/ui";
import { ProgramAdvice } from "@/data/programs";
import { Text, View } from "react-native";
import { ProgramAdviceCard } from "./ProgramAdviceCard";

interface ProgramAdviceSectionProps {
  advice: ProgramAdvice[];
}

/**
 * Container for all training advice within a program.
 * Renders static, educational content.
 */
export function ProgramAdviceSection({ advice }: ProgramAdviceSectionProps) {
  if (advice.length === 0) return null;

  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1">
        Recovery Guidelines
      </Text>
      <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-4">
        Evidence-based advice for optimal results
      </Text>

      <View>
        {advice.map((item, index) => (
          <View
            key={item.id}
            className={
              index < advice.length - 1
                ? "border-b border-gray-100 dark:border-gray-800 pb-4"
                : ""
            }
          >
            <ProgramAdviceCard advice={item} />
          </View>
        ))}
      </View>
    </Card>
  );
}
