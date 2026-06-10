/**
 * Panel de operación: ahorro hídrico acumulado + telemetría del core cuántico.
 * Los números van en mono (JetBrains) — lectura de sala de control.
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors, fonts } from "../theme";

interface Props {
  totalSaved: number;       // L/s evitados acumulados
  lastSolveMs: number | null;
  numQubits: number | null;
  convergence: number[];
  connected: boolean;
  twinMode?: boolean;       // true = QUBO resuelto en el propio dispositivo
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

export default function SavingsPanel({ totalSaved, lastSolveMs, numQubits, convergence, connected, twinMode, horizontal }: Props) {
  return (
    <View style={[styles.panel, horizontal && { width: "100%" }]}>
      <Text style={styles.title}>AHORRO HÍDRICO</Text>
      <AnimatedCounter value={totalSaved} />
      <Text style={styles.unit}>litros por segundo recuperados</Text>
      <Text style={styles.equivalence}>
        ≈ {Math.round(totalSaved * 86.4).toLocaleString()} m³/día ·{" "}
        {Math.round(totalSaved * 86.4 / 10).toLocaleString()} pipas de 10 m³
      </Text>

      <View style={styles.divider} />

      <Text style={styles.title}>QUANTUM CORE</Text>
      <Metric label="Qubits del problema" value={numQubits != null ? `${numQubits}` : "—"} />
      <Metric label="Última optimización" value={lastSolveMs != null ? `${lastSolveMs} ms` : "—"} />
      <Metric label="Solver" value={twinMode ? "SA · en dispositivo" : "SA · core remoto"} />
      <Metric label="Estado" value={connected ? "● EN LÍNEA" : "○ RECONECTANDO"} accent={connected} />

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
      {convergence.length > 1 && (
        <Text style={styles.caption}>convergencia de energía QUBO ↓</Text>
      )}
    </View>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && { color: colors.agua }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 270,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.agua,
    padding: 20,
  },
  title: {
    color: colors.textMuted, fontSize: 10, letterSpacing: 3,
    fontFamily: fonts.monoRegular, marginBottom: 10,
  },
  bigNumber: { color: colors.agua, fontSize: 40, fontFamily: fonts.mono },
  unit: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginBottom: 6 },
  equivalence: { color: colors.gold, fontSize: 11, fontFamily: fonts.monoRegular, marginBottom: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body },
  metricValue: { color: colors.text, fontSize: 12, fontFamily: fonts.monoRegular },
  sparkline: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 44, marginTop: 14 },
  bar: { flex: 1, backgroundColor: colors.violet, borderRadius: 1, opacity: 0.85 },
  caption: { color: colors.textFaint, fontSize: 10, fontFamily: fonts.monoRegular, marginTop: 5 },
});
