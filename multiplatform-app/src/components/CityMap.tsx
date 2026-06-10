/**
 * Mapa operativo — cartografía oscura real de Puebla (CARTO Dark Matter,
 * proyección Web Mercator) con la red troncal como venas de agua luminosas.
 *
 *  - Vena turquesa con glow  → agua fluyendo
 *  - Vena roja pulsante      → fuga detectada
 *  - Trazo apagado punteado  → válvula cerrada por el optimizador
 *  - Rombo dorado            → batería de pozos (fuente)
 *  - Tocar una tubería       → simular fuga (modo prueba)
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, {
  Circle, Line, Rect, Text as SvgText, Image as SvgImage,
} from "react-native-svg";
import { NetNode, NetPipe } from "../hooks/useQuantumFeed";
import { colors } from "../theme";

interface Props {
  nodes: NetNode[];
  pipes: NetPipe[];
  openPipes: Set<number>;
  onPipePress: (pipeId: number) => void;
}

const ZOOM = 12;
const TILE = 256;
const LABEL_FONT = Platform.select({
  web: "Archivo, system-ui, sans-serif",
  default: "Archivo_700Bold",
});

/** lon/lat → píxeles del mundo en Web Mercator (mismo sistema que las teselas) */
function toWorldPx(lon: number, lat: number) {
  const n = 2 ** ZOOM;
  const x = ((lon + 180) / 360) * n * TILE;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * TILE;
  return { x, y };
}

/** Posición de etiqueta por nodo, ajustada a mano para evitar colisiones.
 *  [dx, dy, anchor]  — anchor: start | middle | end */
const LABELS: Record<number, [number, number, "start" | "middle" | "end"]> = {
  0: [0, -16, "middle"],   // Pozos Norte
  1: [16, 5, "start"],     // Pozos Oriente (el más al este → a la derecha)
  2: [-16, 5, "end"],      // Pozos Sur-Poniente (al oeste → a la izquierda)
  3: [14, 5, "start"],     // Centro Histórico
  4: [14, -8, "start"],    // Xonaca
  5: [14, -8, "start"],    // La Paz (su vecina La Libertad va a la izquierda)
  6: [-14, 5, "end"],      // San Felipe (su vecino San Jerónimo va arriba)
  7: [0, -16, "middle"],   // San Jerónimo Caleras
  8: [14, 12, "start"],    // La Margarita
  9: [14, -8, "start"],    // San Manuel
  10: [0, -16, "middle"],  // Bosques de San Sebastián
  11: [0, 22, "middle"],   // Amalucan (debajo, para no chocar con Bosques)
  12: [0, 22, "middle"],   // Agua Santa
  13: [0, 22, "middle"],   // Castillotla
  14: [-14, 12, "end"],    // San Baltazar Campeche
  15: [-14, 5, "end"],     // Las Ánimas
  16: [0, 22, "middle"],   // Angelópolis
  17: [-14, -8, "end"],    // La Libertad
  18: [-14, 12, "end"],    // Mayorazgo
};

export default function CityMap({ nodes, pipes, openPipes, onPipePress }: Props) {
  const layout = useMemo(() => {
    if (nodes.length === 0) return null;
    const MARGIN = 0.014;
    const lons = nodes.map(n => n.x);
    const lats = nodes.map(n => n.y);
    const tl = toWorldPx(Math.min(...lons) - MARGIN, Math.max(...lats) + MARGIN);
    const br = toWorldPx(Math.max(...lons) + MARGIN, Math.min(...lats) - MARGIN);

    const tx0 = Math.floor(tl.x / TILE), ty0 = Math.floor(tl.y / TILE);
    const tx1 = Math.floor(br.x / TILE), ty1 = Math.floor(br.y / TILE);
    const tiles: Array<{ key: string; px: number; py: number; uri: string }> = [];
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = ty0; ty <= ty1; ty++) {
        tiles.push({
          key: `${tx}-${ty}`,
          px: tx * TILE - tl.x,
          py: ty * TILE - tl.y,
          // Basemap oscuro profesional (CARTO Dark Matter, sin etiquetas ruidosas)
          uri: `https://basemaps.cartocdn.com/dark_nolabels/${ZOOM}/${tx}/${ty}.png`,
        });
      }
    }
    const W = br.x - tl.x;
    const H = br.y - tl.y;
    const pos = (id: number) => {
      const n = nodes.find(n => n.id === id)!;
      const p = toWorldPx(n.x, n.y);
      return { x: p.x - tl.x, y: p.y - tl.y };
    };
    return { tiles, W, H, pos };
  }, [nodes]);

  if (!layout) return <View style={styles.container} />;
  const { tiles, W, H, pos } = layout;

  const shortName = (name: string) =>
    name.startsWith("Batería") ? "POZOS" : name.split("–")[0].split("(")[0].trim();

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Capa 1: cartografía oscura real */}
        {tiles.map(t => (
          <SvgImage key={t.key} x={t.px} y={t.py} width={TILE} height={TILE}
                    href={t.uri} opacity={0.92} />
        ))}
        {/* Tinte cobalto sutil para integrar el basemap a la paleta */}
        <Rect x={-TILE} y={-TILE} width={W + 2 * TILE} height={H + 2 * TILE}
              fill={colors.bg} opacity={0.25} />

        {/* Capa 2: glow exterior de las venas (se dibuja primero, debajo) */}
        {pipes.map(p => {
          const a = pos(p.source);
          const b = pos(p.target);
          const isOpen = openPipes.has(p.id);
          if (!isOpen && !p.has_anomaly) return null;
          return (
            <Line key={`glow-${p.id}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={p.has_anomaly ? colors.alarm : colors.agua}
              strokeWidth={p.has_anomaly ? 11 : 8}
              strokeLinecap="round"
              opacity={p.has_anomaly ? 0.35 : 0.22}
            />
          );
        })}

        {/* Capa 3: trazo principal de las venas */}
        {pipes.map(p => {
          const a = pos(p.source);
          const b = pos(p.target);
          const isOpen = openPipes.has(p.id);
          const color = p.has_anomaly ? colors.alarm : isOpen ? colors.agua : "#2A3A63";
          return (
            <Line key={p.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={color}
              strokeWidth={p.has_anomaly ? 4 : isOpen ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeDasharray={isOpen || p.has_anomaly ? undefined : "5 6"}
              opacity={isOpen || p.has_anomaly ? 1 : 0.65}
              onPress={() => onPipePress(p.id)}
            />
          );
        })}

        {/* Capa 4: nodos */}
        {nodes.map(n => {
          const { x, y } = pos(n.id);
          if (n.is_source) {
            // Rombo dorado = batería de pozos
            return (
              <Rect key={n.id}
                x={x - 7} y={y - 7} width={14} height={14}
                fill={colors.gold} stroke="#070D24" strokeWidth={2}
                transform={`rotate(45 ${x} ${y})`}
              />
            );
          }
          return (
            <React.Fragment key={n.id}>
              <Circle cx={x} cy={y} r={7} fill={colors.bg}
                      stroke={colors.agua} strokeWidth={2} />
              <Circle cx={x} cy={y} r={2.5} fill={colors.agua} />
            </React.Fragment>
          );
        })}

        {/* Capa 5: etiquetas con halo (texto doble: halo oscuro + relleno) */}
        {nodes.map(n => {
          const { x, y } = pos(n.id);
          const [dx, dy, anchor] = LABELS[n.id] ?? [0, -16, "middle"];
          const label = shortName(n.name);
          const isSource = n.is_source;
          return (
            <React.Fragment key={`label-${n.id}`}>
              <SvgText x={x + dx} y={y + dy}
                fontFamily={LABEL_FONT} fontSize={isSource ? 9.5 : 11}
                fontWeight="700" textAnchor={anchor}
                stroke="#070D24" strokeWidth={3.5} opacity={0.9}>
                {label}
              </SvgText>
              <SvgText x={x + dx} y={y + dy}
                fontFamily={LABEL_FONT} fontSize={isSource ? 9.5 : 11}
                fontWeight="700" textAnchor={anchor}
                fill={isSource ? colors.gold : "#D7E2F7"}
                letterSpacing={isSource ? 1 : 0}>
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      <Text style={styles.attribution}>© OpenStreetMap · © CARTO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    minHeight: 320,
  },
  attribution: {
    position: "absolute",
    bottom: 4,
    right: 8,
    color: colors.textFaint,
    fontSize: 9,
  },
});
