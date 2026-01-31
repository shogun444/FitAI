import { Card, ToggleSwitch } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface ProteinFoodListProps {
  usesWheyProtein: boolean;
  onWheyProteinChange: (value: boolean) => void;
}

// Static food data - educational only, not tracked
const FOOD_CATEGORIES = [
  {
    title: "Animal Sources",
    icon: "fish" as const,
    items: ["Eggs", "Chicken breast", "Fish", "Greek yogurt"],
  },
  {
    title: "Vegetarian Sources",
    icon: "leaf" as const,
    items: ["Paneer", "Dal / lentils", "Chickpeas", "Soy / tofu"],
  },
];

/**
 * Educational list of high-protein foods.
 * Static content - no tracking, no persistence.
 */
export function ProteinFoodList({
  usesWheyProtein,
  onWheyProteinChange,
}: ProteinFoodListProps) {
  return (
    <Card className="mb-4">
      <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white mb-1">
        High-Protein Foods
      </Text>
      <Text className="font-secondary text-gray-500 dark:text-gray-400 text-sm mb-4">
        Commonly used for muscle building
      </Text>

      {/* Food Categories */}
      <View className="gap-4 mb-5">
        {FOOD_CATEGORIES.map((category) => (
          <View key={category.title}>
            <View className="flex-row items-center mb-2">
              <Ionicons name={category.icon} size={16} color="#c9f158" />
              <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm ml-2">
                {category.title}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {category.items.map((item) => (
                <View
                  key={item}
                  className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
                >
                  <Text className="font-secondary text-gray-700 dark:text-gray-300 text-sm">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Whey Protein Toggle */}
      <View className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="flask" size={16} color="#c9f158" />
          <Text className="font-secondaryMedium text-gray-700 dark:text-gray-300 text-sm ml-2">
            Supplement (Optional)
          </Text>
        </View>

        <ToggleSwitch
          label="Do you consume whey protein?"
          value={usesWheyProtein}
          onChange={onWheyProteinChange}
          className="mt-2"
        />

        {usesWheyProtein && (
          <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 mt-3">
            <Text className="font-secondary text-gray-700 dark:text-gray-300 text-sm">
              1 scoop of whey protein typically provides ~20–25g protein.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
