import { AppIcon } from "@/components/AppIcon";
import { useBackup } from "@/hooks/useBackup";
import { useAgent } from "@/hooks/useAgent";
import { useTheme } from "@/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useTheme();
  const styles = createStyles(theme);
  const { stopAgent } = useAgent();
  const {
    getMnemonics,
    exportCredentials,
    exportEncryptedBackup,
    clearWalletData,
  } = useBackup();
  const [mnemonics, setMnemonics] = useState<string[] | null>(null);

  useEffect(() => {
    getMnemonics().then(setMnemonics);
  }, [getMnemonics]);

  const handleShowMnemonic = () => {
    if (!mnemonics) return;
    Alert.alert("Recovery Phrase", mnemonics.join(" "), [{ text: "OK", style: "cancel" }]);
  };

  const handleExportCredentials = async () => {
    try {
      await exportCredentials();
    } catch (err) {
      Alert.alert("Export Failed", "Could not export credentials.");
      console.error(err);
    }
  };

  const handleExportEncryptedBackup = async () => {
    try {
      await exportEncryptedBackup();
      Alert.alert(
        "Encrypted Backup Created",
        "The backup JWE has been shared as a file and copied to your clipboard."
      );
    } catch (err) {
      Alert.alert("Backup Failed", "Could not create the encrypted wallet backup.");
      console.error(err);
    }
  };

  const handleResetWallet = () => {
    Alert.alert(
      "Reset Wallet",
      "This will remove all wallet data from this device. Make sure you have backed up your recovery phrase. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearWalletData();
            await stopAgent();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>Wallet storage</Text>
        <Text style={styles.infoBannerText}>
          Credentials and DIDs persist locally via AsyncStorage. Your recovery phrase
          remains in secure storage. Export an encrypted JWE backup before resetting the wallet.
        </Text>
      </View>

      <SettingSection title="Appearance" styles={styles}>
        <View style={styles.modeRow}>
          <Text style={styles.modeLabel}>Theme</Text>
          <View style={styles.modeSwitch}>
            <ThemeChip
              label="Light"
              active={mode === "light"}
              onPress={() => setMode("light")}
              styles={styles}
            />
            <ThemeChip
              label="Dark"
              active={mode === "dark"}
              onPress={() => setMode("dark")}
              styles={styles}
            />
          </View>
        </View>
      </SettingSection>

      <SettingSection title="Backup" styles={styles}>
        <SettingRow
          icon="lock"
          label="View Recovery Phrase"
          description="Show the 24-word mnemonic phrase for this wallet."
          onPress={handleShowMnemonic}
          styles={styles}
          iconColor={theme.colors.primary}
        />
        <SettingRow
          icon="backup"
          label="Export Encrypted Backup"
          description="Create a JWE backup for local credentials, DIDs, and keys."
          onPress={handleExportEncryptedBackup}
          styles={styles}
          iconColor={theme.colors.primary}
        />
        <SettingRow
          icon="backup"
          label="Export Credentials"
          description="Save a JSON copy of all stored credentials."
          onPress={handleExportCredentials}
          styles={styles}
          iconColor={theme.colors.primary}
        />
        <SettingRow
          icon="restore"
          label="Restore Encrypted Backup"
          description="Paste a backup JWE after recovering your mnemonic."
          onPress={() => router.push("/backup-restore" as never)}
          styles={styles}
          iconColor={theme.colors.primary}
        />
      </SettingSection>

      <SettingSection title="About" styles={styles}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SDK Version</Text>
          <Text style={styles.infoValue}>@hyperledger/identus-sdk 7.0.0-rc.12</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Workshop</Text>
          <Text style={styles.infoValue}>React Native Identity Wallet</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project</Text>
          <Text style={styles.infoValue}>Hyperledger Identus</Text>
        </View>
      </SettingSection>

      <SettingSection title="Danger Zone" styles={styles}>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleResetWallet}>
          <Text style={styles.dangerBtnText}>Reset Wallet</Text>
        </TouchableOpacity>
      </SettingSection>
    </ScrollView>
  );
}

function SettingSection({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function ThemeChip({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <TouchableOpacity
      style={[styles.modeChip, active && styles.modeChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SettingRow({
  icon,
  label,
  description,
  onPress,
  styles,
  iconColor,
}: {
  icon: "backup" | "lock" | "restore";
  label: string;
  description: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  iconColor: string;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <AppIcon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>["theme"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16, paddingBottom: 48 },
    infoBanner: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 20,
    },
    infoBannerTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
    },
    infoBannerText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    section: { marginBottom: 28 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSoft,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      overflow: "hidden",
    },
    modeRow: {
      padding: 16,
      gap: 12,
    },
    modeLabel: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 12,
      padding: 4,
      gap: 6,
      alignSelf: "flex-start",
    },
    modeChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    modeChipActive: {
      backgroundColor: theme.colors.primary,
    },
    modeChipText: {
      color: theme.colors.textMuted,
      fontWeight: "700",
    },
    modeChipTextActive: {
      color: theme.colors.primaryText,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    rowText: { flex: 1 },
    rowLabel: { color: theme.colors.text, fontSize: 15, fontWeight: "600", marginBottom: 2 },
    rowDescription: { color: theme.colors.textSoft, fontSize: 12 },
    chevron: { color: theme.colors.textSoft, fontSize: 18, fontWeight: "700" },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background,
    },
    infoLabel: { color: theme.colors.textSoft, fontSize: 13 },
    infoValue: { color: theme.colors.textMuted, fontSize: 13, maxWidth: "60%", textAlign: "right" },
    dangerBtn: {
      margin: 8,
      backgroundColor: theme.colors.dangerSoft,
      borderRadius: 10,
      padding: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.dangerSoft,
    },
    dangerBtnText: { color: theme.colors.danger, fontWeight: "700", fontSize: 15 },
  });
}
