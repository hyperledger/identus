import SDK from "@hyperledger/identus-sdk";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCredentials } from "@/hooks/useCredentials";

export default function CredentialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { getCredentialById } = useCredentials();

  const credential = getCredentialById(id);

  useEffect(() => {
    if (credential) {
      navigation.setOptions({ title: credential.credentialType });
    }
  }, [credential, navigation]);

  if (!credential) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Credential not found</Text>
      </View>
    );
  }

  const TYPE_COLOR: Record<string, string> = {
    [SDK.Domain.CredentialType.JWT]: "#3b82f6",
    [SDK.Domain.CredentialType.SDJWT]: "#8b5cf6",
    [SDK.Domain.CredentialType.AnonCreds]: "#f59e0b",
  };
  const badgeColor = TYPE_COLOR[credential.credentialType] ?? "#6b7280";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type badge */}
      <View style={[styles.badge, { backgroundColor: badgeColor + "22" }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>
          {credential.credentialType}
        </Text>
      </View>

      {/* Metadata */}
      <Section title="Issuer">
        <MonoText>{credential.issuer}</MonoText>
      </Section>

      <Section title="Credential ID">
        <MonoText>{credential.id}</MonoText>
      </Section>

      {/* Claims */}
      <Section title="Claims">
        {credential.claims.length === 0 ? (
          <Text style={styles.empty}>No claims</Text>
        ) : (
          credential.claims.map((claim, i) => (
            <View key={i} style={styles.claimsGroup}>
              {Object.entries(claim).map(([key, value]) => (
                <View key={key} style={styles.claimRow}>
                  <Text style={styles.claimKey}>{key}</Text>
                  <Text style={styles.claimValue}>
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function MonoText({ children }: { children: string }) {
  return <Text style={styles.mono} selectable>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { color: "#64748b", fontSize: 16 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
  },
  empty: { color: "#64748b", fontSize: 13 },
  claimsGroup: { marginBottom: 8 },
  claimRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  claimKey: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  claimValue: {
    color: "#f8fafc",
    fontSize: 13,
    flex: 2,
    textAlign: "right",
  },
});
