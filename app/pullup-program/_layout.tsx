import { Stack } from "expo-router";

/**
 * Layout for the "Unlock Your First Pull-up" guided program.
 * Separate routing namespace from free workouts and paid programs.
 */
export default function PullupProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
