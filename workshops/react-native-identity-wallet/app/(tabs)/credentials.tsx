import { CredentialCard } from "@/components/CredentialCard";
import { useCredentials } from "@/hooks/useCredentials";
import { useTheme } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CredentialsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { credentials } = useCredentials();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.count}>
          {credentials.length} credential{credentials.length !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push("/scan")}>
          <Text style={styles.scanBtnText}>+ Scan Offer</Text>
        </TouchableOpacity>
      </View>

      {credentials.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No credentials yet</Text>
          <Text style={styles.emptySubtitle}>
            Scan a QR code from an issuer to receive your first verifiable credential.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/scan")}>
            <Text style={styles.primaryBtnText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        credentials.map((credential) => (
          <CredentialCard key={credential.id} credential={credential} />
        ))
      )}
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, paddingBottom: 32 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    count: { color: theme.colors.textSoft, fontSize: 14, fontWeight: "600" },
    scanBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
    },
    scanBtnText: { color: theme.colors.primaryText, fontWeight: "700", fontSize: 13 },
    empty: {
      alignItems: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSoft,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 280,
    },
    primaryBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 8,
    },
    primaryBtnText: { color: theme.colors.primaryText, fontWeight: "700", fontSize: 15 },
  });
}
