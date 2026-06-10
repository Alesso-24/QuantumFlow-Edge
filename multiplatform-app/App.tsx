/**
 * QuantumFlow Edge — el agua de Puebla, optimizada con computación cuántica.
 * Un solo código: iOS, Android, Web y Escritorio (Expo + React Native Web).
 */
import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useQuantumFeed } from "./src/hooks/useQuantumFeed";
import HomeScreen from "./src/screens/HomeScreen";
import LiveScreen from "./src/screens/LiveScreen";
import HowItWorksScreen from "./src/screens/HowItWorksScreen";
import DataScreen from "./src/screens/DataScreen";
import { colors } from "./src/theme";

const TABS = [
  { key: "home", label: "Inicio", icon: "🏠" },
  { key: "live", label: "Red en vivo", icon: "🗺️" },
  { key: "how", label: "Cómo funciona", icon: "⚛️" },
  { key: "data", label: "Datos", icon: "📊" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function App() {
  const feed = useQuantumFeed();
  const [tab, setTab] = useState<TabKey>("home");
  const { width } = useWindowDimensions();
  const compact = width < 560;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.logo}>
          ⚛️ QuantumFlow <Text style={{ color: colors.cyan }}>Edge</Text>
        </Text>
        {!compact && (
          <Text style={styles.tagline}>El agua de Puebla, optimizada con computación cuántica</Text>
        )}
        <View style={[styles.statusDot,
          { backgroundColor: feed.connected ? colors.green : colors.red }]} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map(t => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.icon} {compact ? "" : t.label}
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
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10,
  },
  logo: { color: colors.text, fontSize: 20, fontWeight: "800" },
  tagline: { color: colors.textMuted, fontSize: 12, flex: 1 },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginLeft: "auto" },
  tabBar: {
    flexDirection: "row", gap: 6, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: colors.cyan },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.cyan },
  content: { flex: 1 },
});
