import { useAgentContext } from "@/context/AgentContext";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Entry-point redirect: wait for the agent context to determine whether
 * the wallet has been set up, then navigate accordingly.
 */
export default function Index() {
  const { isInitialized, isReady } = useAgentContext();

  // Wait until the keychain lookup (and optional agent start) has completed
  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return isInitialized ? (
    <Redirect href="/(tabs)/wallet" />
  ) : (
    <Redirect href="/onboarding" />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
});
