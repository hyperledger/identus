import { useAgentContext } from "@/context/AgentContext";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { useCallback } from "react";
import { STORAGE_KEYS } from "@/config";

/**
 * Wallet backup and recovery utilities.
 *
 * Backup strategy:
 *   1. Mnemonic phrase (BIP39) — stored in device keychain via expo-secure-store.
 *      This is the primary recovery method. Any wallet with the same seed can
 *      re-derive all PRISM DIDs.
 *   2. Credential export — verifiable credentials are not always recoverable
 *      from the ledger, so they are exported as JSON for safe-keeping.
 */
export function useBackup() {
  const {
    credentials,
    createEncryptedBackup,
    restoreEncryptedBackup,
    clearPlutoStorage,
  } = useAgentContext();

  /**
   * Read the stored mnemonic phrase. Returns null if the wallet has not been
   * initialized yet.
   */
  const getMnemonics = useCallback(async (): Promise<string[] | null> => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.MNEMONICS);
    return stored ? (JSON.parse(stored) as string[]) : null;
  }, []);

  /**
   * Export the wallet credentials to a JSON file and open the share sheet.
   * The export does NOT include the seed — the seed is already backed up via
   * the mnemonic and stored in the device keychain.
   */
  const exportCredentials = useCallback(async (): Promise<void> => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      credentials: credentials.map((c) => ({
        id: c.id,
        type: c.credentialType,
        issuer: c.issuer,
        claims: c.claims,
      })),
    };

    const fileUri =
      FileSystem.cacheDirectory + `identus-backup-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(exportData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Identity Wallet Backup",
      });
    }
  }, [credentials]);

  /**
   * Create an encrypted wallet backup JWE, write it to a file, and share it.
   * The JWE can later be pasted back into the app after the mnemonic has been
   * restored, allowing the wallet to recover local credentials and DIDs.
   */
  const exportEncryptedBackup = useCallback(async (): Promise<string> => {
    const backupJwe = await createEncryptedBackup();
    const fileUri =
      FileSystem.cacheDirectory + `identus-encrypted-backup-${Date.now()}.jwe`;

    await FileSystem.writeAsStringAsync(fileUri, backupJwe, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Clipboard.setStringAsync(backupJwe);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/jose",
        dialogTitle: "Export Encrypted Identus Wallet Backup",
      });
    }

    return backupJwe;
  }, [createEncryptedBackup]);

  const importEncryptedBackup = useCallback(
    async (backupJwe: string): Promise<void> => {
      const trimmed = backupJwe.trim();
      if (!trimmed) {
        throw new Error("Backup JWE is empty");
      }

      await restoreEncryptedBackup(trimmed);
    },
    [restoreEncryptedBackup]
  );

  /**
   * Clear all wallet data from secure storage. Call this before restoring from
   * a different seed or when the user wants to reset the wallet.
   *
   * WARNING: This is irreversible unless the user has backed up their mnemonic.
   */
  const clearWalletData = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.MNEMONICS);
    await clearPlutoStorage();
  }, [clearPlutoStorage]);

  return {
    getMnemonics,
    exportCredentials,
    exportEncryptedBackup,
    importEncryptedBackup,
    clearWalletData,
  };
}
