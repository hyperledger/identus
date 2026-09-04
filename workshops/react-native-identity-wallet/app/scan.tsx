import { QRScanner } from "@/components/QRScanner";
import { useAgent } from "@/hooks/useAgent";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function ScanScreen() {
  const router = useRouter();
  const { acceptOffer } = useAgent();
  const [done, setDone] = useState(false);

  const handleScanned = async (data: string) => {
    try {
      await acceptOffer(data);
      setDone(true);
      Alert.alert(
        "Credential Request Sent",
        "Your credential request has been sent to the issuer. The credential will appear in your wallet once the issuer approves it.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred.";
      Alert.alert("Scan Failed", message, [
        {
          text: "Try Again",
          onPress: () => setDone(false),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {!done && (
        <QRScanner onScanned={handleScanned} onCancel={() => router.back()} />
      )}
    </View>
  );
}
