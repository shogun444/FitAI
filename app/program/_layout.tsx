import { Stack } from "expo-router";

export default function ProgramLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="calibrate"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen name="session" />
      <Stack.Screen
        name="summary"
        options={{
          presentation: "card",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
