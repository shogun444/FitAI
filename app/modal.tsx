import { Button, Heading, Subheading } from "@/components";
import { Link } from "expo-router";
import { View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center  bg-background-light dark:bg-background-dark">
      <Heading className="text-2xl mb-2">This is a modal</Heading>
      <Subheading className="mb-8">
        Your fintech experience starts here
      </Subheading>
      <Link href="/" dismissTo asChild>
        <Button title="Go to home screen" className="mt-4 px-8" />
      </Link>
    </View>
  );
}
