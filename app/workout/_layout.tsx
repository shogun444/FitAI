import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="session" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="history" />
      <Stack.Screen name="select-exercises" />
    </Stack>
  );
}
