import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SDK from "@hyperledger/identus-sdk";
import { useTheme } from "@/theme";

interface Props {
  state: SDK.Domain.Startable.State;
}

const STATUS_LABEL: Record<SDK.Domain.Startable.State, string> = {
  [SDK.Domain.Startable.State.RUNNING]: "Connected",
  [SDK.Domain.Startable.State.STOPPED]: "Disconnected",
  [SDK.Domain.Startable.State.STARTING]: "Connecting...",
  [SDK.Domain.Startable.State.STOPPING]: "Disconnecting...",
};

const STATUS_COLOR: Record<SDK.Domain.Startable.State, string> = {
  [SDK.Domain.Startable.State.RUNNING]: "#22c55e",
  [SDK.Domain.Startable.State.STOPPED]: "#ef4444",
  [SDK.Domain.Startable.State.STARTING]: "#f59e0b",
  [SDK.Domain.Startable.State.STOPPING]: "#f59e0b",
};

export function AgentStatus({ state }: Props) {
  const { theme } = useTheme();
  const styles = createStyles();
  const color = state === SDK.Domain.Startable.State.RUNNING
    ? theme.colors.success
    : state === SDK.Domain.Startable.State.STOPPED
      ? theme.colors.danger
      : theme.colors.warning;
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{STATUS_LABEL[state]}</Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
    },
  });
}
