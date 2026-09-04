import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  did: string;
  label?: string;
}

export function DIDCard({ did, label = "DID" }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(did);
    Alert.alert("Copied", "DID copied to clipboard");
  };

  const truncated = did.length > 34 ? `${did.slice(0, 22)}...${did.slice(-10)}` : did;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.did} numberOfLines={2} selectable>
        {truncated}
      </Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSoft,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    copyBtn: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 6,
    },
    copyText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: "600",
    },
    did: {
      fontFamily: "monospace",
      fontSize: 12,
      color: theme.colors.text,
      lineHeight: 18,
    },
  });
}
