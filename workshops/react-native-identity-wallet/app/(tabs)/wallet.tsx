import SDK from "@hyperledger/identus-sdk";
import { AppIcon } from "@/components/AppIcon";
import { useAgentContext } from "@/context/AgentContext";
import { useDIDs } from "@/hooks/useDIDs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AgentStatus } from "../../src/components/AgentStatus";
import { DIDCard } from "../../src/components/DIDCard";
import { PresentationRequestBanner } from "@/components/PresentationRequestBanner";
import { useTheme } from "@/theme";

export default function WalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { agentState, credentials } = useAgentContext();
  const { dids, loading, refresh, createDID } = useDIDs();
  const [creating, setCreating] = useState(false);

  const handleCreateDID = async () => {
    setCreating(true);
    try {
      await createDID();
      Alert.alert("Success", "New PRISM DID created.");
    } catch (err) {
      Alert.alert("Error", "Could not create DID. Make sure the agent is running.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Agent</Text>
        <AgentStatus state={agentState} />
      </View>

      <PresentationRequestBanner />

      {agentState !== SDK.Domain.Startable.State.RUNNING && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Offline mode</Text>
          <Text style={styles.noticeText}>
            Your wallet is available, but mediator-dependent actions like DIDComm
            messaging may not work until the agent connects.
          </Text>
        </View>
      )}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{dids.length}</Text>
          <Text style={styles.summaryLabel}>DIDs</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{credentials.length}</Text>
          <Text style={styles.summaryLabel}>Credentials</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/scan")}>
            <AppIcon name="scan" size={24} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, creating && styles.disabled]}
            onPress={handleCreateDID}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <AppIcon name="plus" size={24} color={theme.colors.primary} />
            )}
            <Text style={styles.actionLabel}>New DID</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(tabs)/credentials")}
          >
            <AppIcon name="credentials" size={24} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>Credentials</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My DIDs</Text>
        {dids.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No DIDs yet. Tap "New DID" to create one.
            </Text>
          </View>
        ) : (
          dids.map((did) => (
            <View key={did.toString()} style={styles.didItem}>
              <DIDCard did={did.toString()} />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, paddingBottom: 32 },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    statusLabel: { color: theme.colors.textSoft, fontSize: 13, fontWeight: "600" },
    noticeCard: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 16,
    },
    noticeTitle: {
      color: theme.colors.warning,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 4,
    },
    noticeText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
    },
    summaryNumber: { fontSize: 32, fontWeight: "800", color: theme.colors.accent },
    summaryLabel: { fontSize: 12, color: theme.colors.textSoft, fontWeight: "600", marginTop: 2 },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    actionLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: "600" },
    disabled: { opacity: 0.5 },
    empty: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
    },
    emptyText: { color: theme.colors.textSoft, fontSize: 14, textAlign: "center" },
    didItem: { marginBottom: 8 },
  });
}
