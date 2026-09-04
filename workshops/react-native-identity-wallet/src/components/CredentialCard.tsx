import SDK from "@hyperledger/identus-sdk";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  credential: SDK.Domain.Credential;
}

const TYPE_COLOR: Record<string, string> = {
  [SDK.Domain.CredentialType.JWT]: "#3b82f6",
  [SDK.Domain.CredentialType.SDJWT]: "#8b5cf6",
  [SDK.Domain.CredentialType.AnonCreds]: "#f59e0b",
};

export function CredentialCard({ credential }: Props) {
  const router = useRouter();
  const color = TYPE_COLOR[credential.credentialType] ?? "#6b7280";

  const claimCount = credential.claims.reduce(
    (sum, c) => sum + Object.keys(c).length,
    0
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/credential/${credential.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.badge, { backgroundColor: color + "22" }]}>
        <Text style={[styles.badgeText, { color }]}>
          {credential.credentialType}
        </Text>
      </View>

      <Text style={styles.issuer} numberOfLines={1}>
        Issuer: {credential.issuer}
      </Text>

      <Text style={styles.claims}>
        {claimCount} claim{claimCount !== 1 ? "s" : ""}
      </Text>

      <Text style={styles.id} numberOfLines={1}>
        {credential.id.slice(0, 32)}…
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  issuer: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },
  claims: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  id: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#94a3b8",
  },
});
