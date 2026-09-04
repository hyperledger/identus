import { useBackup } from "@/hooks/useBackup";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BackupRestoreScreen() {
  const router = useRouter();
  const { importEncryptedBackup } = useBackup();
  const [backupInput, setBackupInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    try {
      await importEncryptedBackup(backupInput);
      Alert.alert(
        "Backup Restored",
        "The encrypted wallet backup has been restored into this device.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to restore backup.";
      Alert.alert("Restore Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Restore Encrypted Backup</Text>
        <Text style={styles.subtitle}>
          Paste the backup JWE you exported earlier. This should be used after
          your 24-word mnemonic has already been recovered on the device.
        </Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Paste encrypted backup JWE"
          placeholderTextColor="#94a3b8"
          value={backupInput}
          onChangeText={setBackupInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleRestore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Restore Backup</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  textArea: {
    flex: 1,
    minHeight: 220,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f8fafc",
    fontSize: 14,
    padding: 14,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
});
