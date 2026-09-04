import { parseMnemonicPhrase } from "@/agent";
import { useAgent } from "@/hooks/useAgent";
import { useBackup } from "@/hooks/useBackup";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Screen = "welcome" | "backup-warning" | "show-mnemonic" | "recover";

export default function Onboarding() {
  const router = useRouter();
  const { initializeWallet, recoverWallet } = useAgent();
  const { importEncryptedBackup } = useBackup();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [backupInput, setBackupInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Unknown error";
  };

  const handleCreateWallet = useCallback(async () => {
    setLoading(true);
    try {
      const words = await initializeWallet();
      setMnemonics(words);
      setScreen("show-mnemonic");
    } catch (err) {
      Alert.alert("Error", `Failed to create wallet.\n\n${getErrorMessage(err)}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initializeWallet]);

  const handleRecoverWallet = useCallback(async () => {
    let words: string[];
    try {
      words = parseMnemonicPhrase(recoveryInput);
    } catch (error) {
      Alert.alert(
        "Invalid Phrase",
        error instanceof Error ? error.message : "Please enter all 24 mnemonic words."
      );
      return;
    }

    setLoading(true);
    try {
      await recoverWallet(words);
      if (backupInput.trim()) {
        await importEncryptedBackup(backupInput);
      }
      router.replace("/(tabs)/wallet");
    } catch (err) {
      Alert.alert(
        "Recovery Failed",
        `The mnemonic phrase or encrypted backup is invalid, or the wallet could not be restored.\n\n${getErrorMessage(
          err
        )}`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [backupInput, importEncryptedBackup, recoverWallet, recoveryInput, router]);

  if (screen === "welcome") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.screen}>
          <View style={styles.hero}>
            <View style={styles.logoBadge}>
              <Text style={styles.logo}>ID</Text>
            </View>
            <Text style={styles.title}>Identus Wallet</Text>
            <Text style={styles.subtitle}>
              A self-sovereign identity wallet built on Hyperledger Identus.
              Own your credentials without depending on a central authority.
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setScreen("backup-warning")}
            >
              <Text style={styles.primaryBtnText}>Create New Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setScreen("recover")}
            >
              <Text style={styles.secondaryBtnText}>Restore from Phrase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "backup-warning") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.screen}>
          <Text style={styles.sectionTitle}>Before you continue</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Save your recovery phrase</Text>
            <Text style={styles.warningBody}>
              On the next screen you will see 24 words. This is the only way to
              recover your wallet if you lose your device.{"\n\n"}
              - Write them down on paper{"\n"}
              - Never share them with anyone{"\n"}
              - Identus cannot recover them for you
            </Text>
          </View>
          <Text style={styles.supportCopy}>
            Wallet creation works offline. DIDComm connectivity can be configured later.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleCreateWallet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>I Understand - Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "show-mnemonic") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.mnemonicScreen}>
          <ScrollView
            style={styles.mnemonicScroll}
            contentContainerStyle={styles.mnemonicScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mnemonicHero}>
              <Text style={styles.eyebrow}>Recovery backup</Text>
              <Text style={styles.sectionTitle}>Recovery Phrase</Text>
              <Text style={styles.hint}>
                Write these 24 words in order and store them somewhere only you can access.
              </Text>
            </View>

            <View style={styles.securityCard}>
              <Text style={styles.securityTitle}>Keep this private</Text>
              <Text style={styles.securityText}>
                Anyone with this phrase can control your wallet. Store it offline and never
                share it in chat, email, or screenshots.
              </Text>
            </View>

            <View style={styles.mnemonicGrid}>
              {mnemonics.map((word, i) => (
                <View key={i} style={styles.mnemonicItem}>
                  <Text style={styles.mnemonicIndex}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={styles.mnemonicWord}>{word}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.bottomDock}>
            <Text style={styles.bottomHelper}>
              Confirm only after you have written the phrase down in the correct order.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace("/(tabs)/wallet")}
            >
              <Text style={styles.primaryBtnText}>I've Saved My Phrase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "recover") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.sectionTitle}>Restore Wallet</Text>
          <Text style={styles.hint}>
            Enter your 24-word recovery phrase, separated by spaces.
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="word1 word2 word3 ..."
            placeholderTextColor="#94a3b8"
            value={recoveryInput}
            onChangeText={setRecoveryInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Optional: paste your encrypted backup JWE to restore local credentials
            and DID metadata after the mnemonic is recovered.
          </Text>
          <TextInput
            style={[styles.textArea, styles.backupArea]}
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
            onPress={handleRecoverWallet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Restore Wallet</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setScreen("welcome")}
          >
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061a33",
  },
  screen: {
    flex: 1,
    backgroundColor: "#061a33",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  mnemonicScreen: {
    flex: 1,
    backgroundColor: "#061a33",
  },
  mnemonicScroll: {
    flex: 1,
  },
  mnemonicScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#102847",
    borderWidth: 1,
    borderColor: "#1f3b61",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#9ba8ff",
    letterSpacing: 1.5,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#f8fafc" },
  subtitle: {
    fontSize: 15,
    color: "#9fb0c7",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 10,
  },
  eyebrow: {
    color: "#8ea1bb",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  hint: {
    fontSize: 15,
    color: "#9fb0c7",
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 360,
  },
  mnemonicHero: {
    marginBottom: 14,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#6d6af8",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6d6af8",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#274567",
    marginTop: 8,
  },
  secondaryBtnText: { color: "#9fb0c7", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  warningBox: {
    backgroundColor: "#102847",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#7f62201f",
    padding: 18,
    marginVertical: 24,
    gap: 8,
  },
  warningTitle: { color: "#f7c34d", fontWeight: "800", fontSize: 16 },
  warningBody: { color: "#d4dceb", fontSize: 14, lineHeight: 21 },
  supportCopy: {
    color: "#7287a3",
    fontSize: 13,
    lineHeight: 18,
  },
  securityCard: {
    backgroundColor: "#0f2746",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f3b61",
    padding: 16,
    marginBottom: 18,
  },
  securityTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  securityText: {
    color: "#9fb0c7",
    fontSize: 13,
    lineHeight: 20,
  },
  mnemonicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  mnemonicItem: {
    width: "48.5%",
    backgroundColor: "#132b46",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#1f3b61",
    flexDirection: "row",
    alignItems: "center",
  },
  mnemonicIndex: {
    fontSize: 12,
    color: "#8f92ff",
    fontWeight: "800",
    minWidth: 28,
  },
  mnemonicWord: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  bottomDock: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#061a33",
    borderTopWidth: 1,
    borderTopColor: "#183452",
  },
  bottomHelper: {
    color: "#8094af",
    fontSize: 12,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: "#102847",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#274567",
    color: "#f8fafc",
    fontSize: 15,
    padding: 14,
    height: 140,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  backupArea: {
    height: 120,
  },
});
