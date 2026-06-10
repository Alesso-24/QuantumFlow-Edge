/** Red en vivo — el centro de control: mapa real + ahorro + modo prueba. */
import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import CityMap from "../components/CityMap";
import SavingsPanel from "../components/SavingsPanel";
import { colors, fonts } from "../theme";
import type { QuantumState } from "../hooks/useQuantumFeed";

type Props = QuantumState & { simulateLeak: (id: number) => void };

export default function LiveScreen(feed: Props) {
  const { width } = useWindowDimensions();
  const stacked = width < 760;   // teléfono vertical → panel debajo del mapa

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>
          {feed.twinMode
            ? "🛰️ Gemelo digital de la red real (sin telemetría física)"
            : `🔌 Conectado · ${feed.server}`}
        </Text>
        <Pressable
          style={styles.testButton}
          onPress={() => {
            if (feed.pipes.length > 0) {
              const random = feed.pipes[Math.floor(Math.random() * feed.pipes.length)];
              feed.simulateLeak(random.id);
            }
          }}
        >
          <Text style={styles.testButtonText}>⚠️ Simular fuga</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>
        Toca cualquier tubería del mapa para simular una fuga en ese tramo y ver
        al optimizador cuántico reorganizar la red.
      </Text>

      <View style={[styles.body, stacked && { flexDirection: "column" }]}>
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
          horizontal={stacked}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 14 },
  toolbar: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  toolbarText: { color: colors.textMuted, fontSize: 11, flex: 1, fontFamily: fonts.monoRegular },
  testButton: {
    backgroundColor: "#FF4D6A1E", borderColor: colors.alarm, borderWidth: 1,
    borderRadius: 4, paddingHorizontal: 14, paddingVertical: 9,
  },
  testButtonText: { color: colors.alarm, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1 },
  hint: { color: colors.textFaint, fontSize: 11, marginTop: 7, marginBottom: 10, fontFamily: fonts.body },
  body: { flex: 1, flexDirection: "row", gap: 14 },
});
