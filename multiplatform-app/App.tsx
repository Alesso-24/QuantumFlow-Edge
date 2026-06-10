/**
 * QuantumFlow Edge — Centro de control de la red hídrica de Puebla.
 * El MISMO código corre en iOS, Android, Web y Desktop (Expo + React Native Web).
 *
 * Servidor configurable: en web, abrir con  ?server=IP:8000
 */
import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useQuantumFeed } from "./src/hooks/useQuantumFeed";
import CityMap from "./src/components/CityMap";
import SavingsPanel from "./src/components/SavingsPanel";

export default function App() {
  const feed = useQuantumFeed();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.logo}>⚛️ QuantumFlow <Text style={{ color: "#00E5FF" }}>Edge</Text></Text>
        <Text style={styles.subtitle}>
          Red de agua potable de Puebla · 1.81 M habitantes · 963 colonias
          {feed.twinMode
            ? "  ·  🛰️ GEMELO DIGITAL (sin telemetría física)"
            : `  ·  servidor: ${feed.server}`}
        </Text>
        <Pressable
          style={styles.testButton}
          onPress={() => {
            // Modo prueba: evento de fuga en una tubería aleatoria
            if (feed.pipes.length > 0) {
              const random = feed.pipes[Math.floor(Math.random() * feed.pipes.length)];
              feed.simulateLeak(random.id);
            }
          }}
        >
          <Text style={styles.testButtonText}>⚠️ Simular fuga (modo prueba)</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <CityMap
          nodes={feed.nodes}
          pipes={feed.pipes}
          openPipes={feed.openPipes}
          onPipePress={feed.simulateLeak}
        />
        <SavingsPanel
          totalSaved={feed.totalSaved}
          lastSolveMs={feed.lastSolveMs}
          numQubits={feed.numQubits}
          convergence={feed.convergence}
          connected={feed.connected}
        />
      </View>

      <Text style={styles.footer}>
        Zonas y cifras base: datos públicos de Agua de Puebla / SOAPAP / CONAGUA ·
        demandas por sector estimadas (metodología en docs/DATA.md) ·
        telemetría simulada hasta el despliegue de hardware
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060B18", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" },
  logo: { color: "#E6F1FF", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#5A7396", fontSize: 12, flex: 1 },
  testButton: {
    backgroundColor: "#FF3B5C22",
    borderColor: "#FF3B5C",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  testButtonText: { color: "#FF3B5C", fontWeight: "700", fontSize: 13 },
  body: { flex: 1, flexDirection: "row", gap: 16 },
  footer: { color: "#3A4F6E", fontSize: 10, marginTop: 10, textAlign: "center" },
});
