import { Stack } from "expo-router";

/**
 * Layout for timed follow-along workouts.
 * Separate routing namespace from free workouts and programs.
 *
 * Headers are disabled - screens use the unified ScreenHeader component.
 */
export default function TimedWorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="session" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
