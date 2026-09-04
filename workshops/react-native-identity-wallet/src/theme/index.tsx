import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

export type ThemeMode = "dark" | "light";

type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textMuted: string;
    textSoft: string;
    primary: string;
    primaryText: string;
    accent: string;
    warning: string;
    danger: string;
    dangerSoft: string;
    success: string;
    tabBar: string;
  };
};

const STORAGE_KEY = "identus.theme.mode";

const themes: Record<ThemeMode, AppTheme> = {
  dark: {
    mode: "dark",
    colors: {
      background: "#061a33",
      surface: "#132b46",
      surfaceMuted: "#102847",
      border: "#264566",
      text: "#f8fafc",
      textMuted: "#9fb0c7",
      textSoft: "#6f84a0",
      primary: "#6d6af8",
      primaryText: "#ffffff",
      accent: "#9ba8ff",
      warning: "#f7c34d",
      danger: "#ef4444",
      dangerSoft: "#ef444420",
      success: "#22c55e",
      tabBar: "#081c34",
    },
  },
  light: {
    mode: "light",
    colors: {
      background: "#f3f7fb",
      surface: "#ffffff",
      surfaceMuted: "#eef4fb",
      border: "#d7e3f0",
      text: "#0f172a",
      textMuted: "#475569",
      textSoft: "#64748b",
      primary: "#4f46e5",
      primaryText: "#ffffff",
      accent: "#4f46e5",
      warning: "#b7791f",
      danger: "#dc2626",
      dangerSoft: "#fee2e2",
      success: "#16a34a",
      tabBar: "#ffffff",
    },
  },
};

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await SecureStore.setItemAsync(STORAGE_KEY, nextMode);
  };

  const toggleMode = async () => {
    await setMode(mode === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      theme: themes[mode],
      mode,
      setMode,
      toggleMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
