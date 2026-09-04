import React from "react";
import { StyleSheet, View } from "react-native";

type IconName =
  | "wallet"
  | "credentials"
  | "settings"
  | "scan"
  | "plus"
  | "backup"
  | "lock"
  | "restore";

export function AppIcon({
  name,
  color,
  size = 22,
}: {
  name: IconName;
  color: string;
  size?: number;
}) {
  const common = { color, size };

  switch (name) {
    case "wallet":
      return <WalletIcon {...common} />;
    case "credentials":
      return <CredentialsIcon {...common} />;
    case "settings":
      return <SettingsIcon {...common} />;
    case "scan":
      return <ScanIcon {...common} />;
    case "plus":
      return <PlusIcon {...common} />;
    case "backup":
      return <BackupIcon {...common} />;
    case "lock":
      return <LockIcon {...common} />;
    case "restore":
      return <RestoreIcon {...common} />;
    default:
      return null;
  }
}

function WalletIcon({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={[
        styles.walletBody,
        {
          width: size,
          height: size * 0.74,
          borderColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.walletFold,
          {
            width: size * 0.34,
            height: size * 0.2,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.walletDot,
          {
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: size * 0.06,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function CredentialsIcon({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={[
        styles.cardBody,
        {
          width: size,
          height: size * 0.72,
          borderColor: color,
        },
      ]}
    >
      <View style={[styles.cardLine, { backgroundColor: color, width: size * 0.54 }]} />
      <View style={[styles.cardLine, { backgroundColor: color, width: size * 0.38 }]} />
      <View style={[styles.cardLine, { backgroundColor: color, width: size * 0.6 }]} />
    </View>
  );
}

function SettingsIcon({ color, size }: { color: string; size: number }) {
  const spoke = size * 0.12;
  const radius = size * 0.42;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {[0, 45, 90, 135].map((rotation, index) => (
        <View
          key={index}
          style={[
            styles.spoke,
            {
              width: spoke,
              height: radius,
              backgroundColor: color,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.settingsRing,
          {
            width: size * 0.58,
            height: size * 0.58,
            borderRadius: size * 0.29,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.settingsInner,
          {
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function ScanIcon({ color, size }: { color: string; size: number }) {
  const corner = size * 0.38;
  const thickness = Math.max(2, Math.round(size * 0.1));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.cornerTopLeft,
          {
            width: corner,
            height: corner,
            borderColor: color,
            borderLeftWidth: thickness,
            borderTopWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          styles.cornerTopRight,
          {
            width: corner,
            height: corner,
            borderColor: color,
            borderRightWidth: thickness,
            borderTopWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          styles.cornerBottomLeft,
          {
            width: corner,
            height: corner,
            borderColor: color,
            borderLeftWidth: thickness,
            borderBottomWidth: thickness,
          },
        ]}
      />
      <View
        style={[
          styles.cornerBottomRight,
          {
            width: corner,
            height: corner,
            borderColor: color,
            borderRightWidth: thickness,
            borderBottomWidth: thickness,
          },
        ]}
      />
    </View>
  );
}

function PlusIcon({ color, size }: { color: string; size: number }) {
  const thickness = Math.max(2, Math.round(size * 0.12));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          position: "absolute",
          width: size * 0.72,
          height: thickness,
          backgroundColor: color,
          borderRadius: thickness / 2,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: thickness,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: thickness / 2,
        }}
      />
    </View>
  );
}

function BackupIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size * 0.76,
          height: size * 0.68,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 5,
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: size * 0.1,
        }}
      >
        <View
          style={{
            width: size * 0.26,
            height: size * 0.18,
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: size * 0.22,
          width: size * 0.44,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function LockIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center" }}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.3,
          borderWidth: 1.8,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.22,
          marginTop: size * 0.08,
        }}
      />
      <View
        style={{
          width: size * 0.68,
          height: size * 0.5,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 6,
          marginTop: -1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: color,
            borderRadius: size * 0.05,
          }}
        />
      </View>
    </View>
  );
}

function RestoreIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size * 0.62,
          height: size * 0.62,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: size * 0.31,
          borderRightColor: "transparent",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.14,
          top: size * 0.12,
          width: 0,
          height: 0,
          borderTopWidth: size * 0.12,
          borderBottomWidth: size * 0.12,
          borderRightWidth: size * 0.18,
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderRightColor: color,
          transform: [{ rotate: "20deg" }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  walletBody: {
    borderWidth: 1.8,
    borderRadius: 6,
    justifyContent: "center",
    paddingLeft: 3,
  },
  walletFold: {
    position: "absolute",
    top: -1,
    left: 2,
    borderTopWidth: 1.8,
    borderLeftWidth: 1.8,
    borderTopLeftRadius: 4,
  },
  walletDot: {
    alignSelf: "flex-end",
    marginRight: 5,
  },
  cardBody: {
    borderWidth: 1.8,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 3,
  },
  cardLine: {
    height: 2,
    borderRadius: 1,
  },
  spoke: {
    position: "absolute",
    borderRadius: 999,
  },
  settingsRing: {
    position: "absolute",
    borderWidth: 1.8,
  },
  settingsInner: {
    position: "absolute",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 4,
  },
});
