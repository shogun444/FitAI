import { Stack } from "expo-router";

/**
 * Layout for timed follow-along workouts.
 * Separate routing namespace from free workouts and programs.
 */
export default function TimedWorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: (route.params as { title?: string })?.title ?? "Workout",
        })}
      />
      <Stack.Screen
        name="session"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: "Workout Complete",
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
