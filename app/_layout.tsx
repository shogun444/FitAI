import "../global.css";

import { InlineRestTimer, ProgramRestTimer } from "@/components/programs";
import {
  RestTimerProvider,
  useGlobalRestTimer,
} from "@/contexts/RestTimerContext";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { seedExercises } from "@/lib/storage";
import { initializeUserId } from "@/lib/user";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "Manrope-Regular": Manrope_400Regular,
    "Manrope-Medium": Manrope_500Medium,
    "Manrope-SemiBold": Manrope_600SemiBold,
    "Manrope-Bold": Manrope_700Bold,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
  });

  // Initialize app data on startup
  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize userId first (required for feedback system)
        await initializeUserId();
        // Seed exercise catalog
        await seedExercises();
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        setIsAppReady(true);
      }
    }
    initializeApp();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAppReady]);

  // Prevent rendering until fonts and app data are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isAppReady) {
    return null;
  }

  return (
    <RestTimerProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutContent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </RestTimerProvider>
  );
}

/**
 * Inner layout component that can access RestTimerContext.
 * Shows global rest timer indicator across all screens.
 */
function RootLayoutContent() {
  const { timer, isModalVisible, openModal, closeModal } = useGlobalRestTimer();
  const pathname = usePathname();

  // Hide floating timer indicator on session pages (they have their own trigger button)
  // The timer STILL works - just the floating indicator is hidden to avoid visual clutter
  const isSessionPage =
    pathname === "/program/session" ||
    pathname === "/workout/session" ||
    pathname === "/pullup-program/session";

  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ headerShown: false }} />
        <Stack.Screen name="program" options={{ headerShown: false }} />
        <Stack.Screen name="pullup-program" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      {/* Global Rest Timer Indicator - hidden on session pages (they have trigger buttons) */}
      {!isModalVisible && !isSessionPage && (
        <View className="absolute top-28 left-4 right-4 z-40">
          <InlineRestTimer timer={timer} onExpand={openModal} />
        </View>
      )}

      {/* Global Rest Timer Modal - available on ALL screens */}
      {isModalVisible && (
        <View className="absolute inset-0 z-50">
          <ProgramRestTimer timer={timer} onDismiss={closeModal} />
        </View>
      )}
    </View>
  );
}
