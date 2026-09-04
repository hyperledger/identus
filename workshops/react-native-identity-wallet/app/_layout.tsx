import { AgentProvider } from "@/context/AgentContext";
import { ThemeProvider, useTheme } from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AgentProvider>
        <ThemedRootLayout />
      </AgentProvider>
    </ThemeProvider>
  );
}

function ThemedRootLayout() {
  const { theme, mode } = useTheme();

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="backup-restore"
          options={{ title: "Restore Backup" }}
        />
        <Stack.Screen
          name="scan"
          options={{ title: "Scan QR Code", presentation: "modal" }}
        />
        <Stack.Screen
          name="credential/[id]"
          options={{ title: "Credential Details" }}
        />
      </Stack>
    </>
  );
}
