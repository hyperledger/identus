import { Tabs } from "expo-router";
import React from "react";
import { AppIcon } from "@/components/AppIcon";
import { useTheme } from "@/theme";

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSoft,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "700" },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarLabel: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          title: "Credentials",
          tabBarLabel: "Credentials",
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="credentials" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
