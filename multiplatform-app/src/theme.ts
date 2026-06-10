/**
 * Sistema de diseño QuantumFlow Edge — "Expediente hidráulico × Talavera poblana".
 *
 * La cerámica Talavera de Puebla es cobalto sobre blanco: nuestra tinta es un
 * cobalto profundo (nunca negro puro), el TURQUESA AGUA se reserva para el agua
 * viva (tuberías activas, cifras de ahorro) y el ORO TALAVERA para las fuentes
 * (pozos) y los acentos de expediente técnico.
 *
 * Tipografía: Unbounded (display civic-tech, con moderación) ·
 * Archivo (cuerpo) · JetBrains Mono (telemetría y cifras).
 */
export const colors = {
  // Tintas
  bg: "#070D24",          // tinta cobalto profunda
  surface: "#0C1430",
  surfaceAlt: "#091026",
  border: "#1B2A52",
  // Acentos (cada uno con un significado fijo)
  agua: "#2EE6CF",        // SOLO agua viva: flujo, ahorro, estado en línea
  cobalt: "#3D6BFF",      // acciones, enlaces, marca
  gold: "#F2B441",        // pozos, eyebrows de expediente, datos estimados
  alarm: "#FF4D6A",       // fugas y modo prueba
  violet: "#9D6BFF",      // capa cuántica (convergencia QUBO)
  // Texto
  text: "#EAF0FF",
  textDim: "#A9B8DC",
  textMuted: "#5F7099",
  textFaint: "#3D4C73",
  // Compat (alias usados por componentes previos)
  cyan: "#2EE6CF",
  green: "#2EE6CF",
  red: "#FF4D6A",
};

export const fonts = {
  display: "Unbounded_700Bold",
  displayLight: "Unbounded_400Regular",
  body: "Archivo_400Regular",
  bodyMedium: "Archivo_500Medium",
  bodyBold: "Archivo_700Bold",
  mono: "JetBrainsMono_700Bold",
  monoRegular: "JetBrainsMono_400Regular",
};

export const badge = {
  liveReal: { label: "● REAL · EN VIVO", color: colors.agua },
  real: { label: "■ REAL · PUBLICADO", color: colors.cobalt },
  estimated: { label: "▲ ESTIMADO", color: colors.gold },
  simulated: { label: "◆ SIMULADO", color: colors.alarm },
};
