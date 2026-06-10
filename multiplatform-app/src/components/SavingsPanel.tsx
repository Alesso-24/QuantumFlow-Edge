/**
 * Panel lateral: ahorro hídrico acumulado + métricas del core cuántico.
 * El contador animado de litros es el número que los jueces van a recordar.
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

interface Props {
  totalSaved: number;       // L/s evitados acumulados
  lastSolveMs: number | null;
  numQubits: number | null;
  convergence: number[];
  connected: boolean;
  horizontal?: boolean;     // true en teléfonos verticales (panel bajo el mapa)
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={styles.bigNumber}>{display.toFixed(1)}</Text>;
}

export default function SavingsPanel({ totalSaved, lastSolveMs, numQubits, convergence, connected, horizontal }: Props) {
  return (
    <View style={[styles.panel, horizontal && { width: "100%" }]}>
      <Text style={styles.title}>💧 AHORRO HÍDRICO</Text>
      <AnimatedCounter value={totalSaved} />
      <Text style={styles.unit}>litros/seg recuperados</Text>
      <Text style={styles.equivalence}>
        ≈ {Math.round(totalSaved * 86.4).toLocaleString()} m³/día
        {"  ·  "}{Math.round(totalSaved * 86.4 / 10).toLocaleString()} pipas de 10 m³
      </Text>

      <View style={styles.divider} />

      <Text style={styles.title}>⚛️ QUANTUM CORE</Text>
      <Metric label="Qubits del problema" value={numQubits != null ? `${numQubits}` : "—"} />
      <Metric label="Última optimización" value={lastSolveMs != null ? `${lastSolveMs} ms` : "—"} />
      <Metric label="Estado" value={connected ? "● EN LÍNEA" : "○ reconectando…"} accent={connected} />

      {convergence.length > 1 && (
        <View style={styles.sparkline}>
          {convergence.map((e, i) => {
            const min = Math.min(...convergence);
            const max = Math.max(...convergence);
            const h = max > min ? 4 + 36 * (1 - (e - min) / (max - min)) : 20;
            return <View key={i} style={[styles.bar, { height: h }]} />;
          })}
        </View>
      )}
      <Text style={styles.caption}>Convergencia de energía QUBO ↓</Text>
    </View>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && { color: "#3DFFA8" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 260,
    backgroundColor: "#0A1426",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#13233D",
    padding: 20,
  },
  title: { color: "#7A93B8", fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  bigNumber: { color: "#00E5FF", fontSize: 44, fontWeight: "800", fontVariant: ["tabular-nums"] },
  unit: { color: "#5A7396", fontSize: 12, marginBottom: 4 },
  equivalence: { color: "#3DFFA8", fontSize: 11, marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#13233D", marginVertical: 16 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  metricLabel: { color: "#5A7396", fontSize: 12 },
  metricValue: { color: "#E6F1FF", fontSize: 12, fontWeight: "600" },
  sparkline: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 44, marginTop: 12 },
  bar: { flex: 1, backgroundColor: "#9D6BFF", borderRadius: 2, opacity: 0.85 },
  caption: { color: "#5A7396", fontSize: 10, marginTop: 4 },
});
