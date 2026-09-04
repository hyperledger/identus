import { useAgentContext } from "@/context/AgentContext";
import { useTheme } from "@/theme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function PresentationRequestBanner() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    pendingPresentationRequest,
    credentials,
    respondToPresentationRequest,
    dismissPresentationRequest,
  } = useAgentContext();
  const [submitting, setSubmitting] = useState(false);

  if (!pendingPresentationRequest) {
    return null;
  }

  const handlePresent = async (credentialId: string) => {
    setSubmitting(true);
    try {
      await respondToPresentationRequest(credentialId);
      Alert.alert("Presentation Sent", "Your credential proof was sent to the verifier.");
    } catch (error) {
      Alert.alert(
        "Presentation Failed",
        error instanceof Error ? error.message : "Could not create the presentation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Presentation request received</Text>
      <Text style={styles.subtitle}>
        A verifier is requesting proof from one of your credentials.
      </Text>

      {credentials.length === 0 ? (
        <Text style={styles.empty}>No stored credentials available to present.</Text>
      ) : (
        credentials.map((credential) => (
          <TouchableOpacity
            key={credential.id}
            style={[styles.option, submitting && styles.disabled]}
            disabled={submitting}
            onPress={() => handlePresent(credential.id)}
          >
            {submitting ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Text style={styles.optionTitle}>{credential.credentialType}</Text>
                <Text style={styles.optionSubtitle} numberOfLines={1}>
                  {credential.issuer}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.dismissBtn} onPress={dismissPresentationRequest}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
    banner: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 16,
      gap: 10,
    },
    title: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    empty: {
      color: theme.colors.textSoft,
      fontSize: 13,
    },
    option: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionTitle: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 14,
    },
    optionSubtitle: {
      color: theme.colors.textSoft,
      fontSize: 12,
      marginTop: 2,
    },
    dismissBtn: {
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    dismissText: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 13,
    },
    disabled: {
      opacity: 0.6,
    },
  });
}
