/**
 * QuantumFlow Edge — el agua de Puebla, optimizada con computación cuántica.
 * Un solo código: iOS, Android, Web y Escritorio (Expo + React Native Web).
 *
 * Identidad: "Expediente hidráulico × Talavera poblana" (ver src/theme.ts).
 */
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Unbounded_400Regular, Unbounded_700Bold,
} from "@expo-google-fonts/unbounded";
import {
  Archivo_400Regular, Archivo_500Medium, Archivo_700Bold,
} from "@expo-google-fonts/archivo";
import {
  JetBrainsMono_400Regular, JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { useQuantumFeed } from "./src/hooks/useQuantumFeed";
import HomeScreen from "./src/screens/HomeScreen";
import LiveScreen from "./src/screens/LiveScreen";
import HowItWorksScreen from "./src/screens/HowItWorksScreen";
import DataScreen from "./src/screens/DataScreen";
import { colors, fonts } from "./src/theme";

const TABS = [
  { key: "home", label: "Inicio" },
  { key: "live", label: "Red en vivo" },
  { key: "how", label: "Cómo funciona" },
  { key: "data", label: "Datos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function App() {
  // fontError también desbloquea: si una fuente falla, la app arranca con
  // las del sistema (Android sustituye familias desconocidas en silencio).
  const [fontsLoaded, fontError] = useFonts({
    Unbounded_400Regular, Unbounded_700Bold,
    Archivo_400Regular, Archivo_500Medium, Archivo_700Bold,
    JetBrainsMono_400Regular, JetBrainsMono_700Bold,
  });
  // Cinturón extra: jamás quedarse en pantalla vacía por las fuentes.
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(t);
  }, []);
  const feed = useQuantumFeed();
  const [tab, setTab] = useState<TabKey>("home");
  const { width } = useWindowDimensions();
  const compact = width < 560;

  if (!fontsLoaded && !fontError && !fontTimeout) {
    return (
      <SafeAreaView style={[styles.root, styles.loadingRoot]}>
        <ActivityIndicator size="large" color={colors.agua} />
        <Text style={styles.loadingText}>QUANTUMFLOW EDGE</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.logo}>
          QUANTUMFLOW<Text style={{ color: colors.agua }}> EDGE</Text>
        </Text>
        {!compact && (
          <Text style={styles.tagline}>
            EXP. QF-PUE-2026 · RED DE AGUA POTABLE DE PUEBLA
          </Text>
        )}
        <View style={[styles.statusDot,
          { backgroundColor: feed.connected ? colors.agua : colors.alarm }]} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabIndex, tab === t.key && { color: colors.gold }]}>
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {compact ? t.label.split(" ")[0] : t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {tab === "home" && <HomeScreen goLive={() => setTab("live")} />}
        {tab === "live" && <LiveScreen {...feed} />}
        {tab === "how" && <HowItWorksScreen />}
        {tab === "data" && <DataScreen server={feed.server} twinMode={feed.twinMode} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loadingRoot: { alignItems: "center", justifyContent: "center", gap: 18 },
  // Sin fontFamily a propósito: debe renderizar aunque las fuentes fallen
  loadingText: { color: colors.textMuted, fontSize: 13, letterSpacing: 4 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10,
  },
  logo: { color: colors.text, fontSize: 15, fontFamily: fonts.display, letterSpacing: 1 },
  tagline: {
    color: colors.textMuted, fontSize: 10, flex: 1,
    fontFamily: fonts.monoRegular, letterSpacing: 1,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginLeft: "auto" },
  tabBar: {
    flexDirection: "row", gap: 4, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabItem: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingVertical: 11, paddingHorizontal: 13,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: colors.agua },
  tabIndex: { color: colors.textFaint, fontSize: 10, fontFamily: fonts.monoRegular },
  tabText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.bodyMedium },
  tabTextActive: { color: colors.text },
  content: { flex: 1 },
});
