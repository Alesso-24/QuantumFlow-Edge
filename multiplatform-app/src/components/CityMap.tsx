/**
 * Mapa operativo sobre cartografía REAL de Puebla (teselas OpenStreetMap,
 * proyección Web Mercator) con la red troncal superpuesta.
 *
 *  - Tubería cian      → flujo normal
 *  - Tubería roja      → fuga detectada
 *  - Tubería apagada   → cerrada por el optimizador cuántico
 *  - Tocar una tubería → simular fuga (modo prueba)
 */
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
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

/** lon/lat → píxeles del mundo en Web Mercator (mismo sistema que las teselas) */
function toWorldPx(lon: number, lat: number) {
  const n = 2 ** ZOOM;
  const x = ((lon + 180) / 360) * n * TILE;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * TILE;
  return { x, y };
}

export default function CityMap({ nodes, pipes, openPipes, onPipePress }: Props) {
  const layout = useMemo(() => {
    if (nodes.length === 0) return null;
    const MARGIN = 0.014; // grados de aire alrededor de la red
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
          uri: `https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`,
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
    name.startsWith("Batería") ? "⚡ Pozos" : name.split("–")[0].split("(")[0].trim();

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Capa 1: cartografía física real (OpenStreetMap) */}
        {tiles.map(t => (
          <SvgImage key={t.key} x={t.px} y={t.py} width={TILE} height={TILE}
                    href={t.uri} opacity={0.85} />
        ))}
        {/* Capa 2: velo oscuro para que la red brille encima */}
        <Rect x={0} y={0} width={W} height={H} fill="#040A18" opacity={0.62} />

        {/* Capa 3: red troncal */}
        {pipes.map(p => {
          const a = pos(p.source);
          const b = pos(p.target);
          const isOpen = openPipes.has(p.id);
          const color = p.has_anomaly ? colors.red : isOpen ? colors.cyan : "#23344F";
          return (
            <Line
              key={p.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={color}
              strokeWidth={p.has_anomaly ? 7 : isOpen ? 4 : 2}
              strokeDasharray={isOpen ? undefined : "7 7"}
              opacity={isOpen || p.has_anomaly ? 1 : 0.6}
              onPress={() => onPipePress(p.id)}
            />
          );
        })}

        {/* Capa 4: nodos y etiquetas */}
        {nodes.map(n => {
          const { x, y } = pos(n.id);
          return (
            <React.Fragment key={n.id}>
              <Circle
                cx={x} cy={y}
                r={n.is_source ? 17 : 10}
                fill={n.is_source ? colors.gold : "#0A1A33"}
                stroke={n.is_source ? colors.gold : colors.cyan}
                strokeWidth={2.5}
              />
              <SvgText x={x} y={y - 22} fill={colors.textDim} fontSize={16}
                       fontWeight="700" textAnchor="middle">
                {shortName(n.name)}
              </SvgText>
              {!n.is_source && (
                <SvgText x={x} y={y + 28} fill={colors.textMuted} fontSize={12}
                         textAnchor="middle">
                  {Math.round(n.demand)} L/s
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
      <Text style={styles.attribution}>Cartografía: © OpenStreetMap contributors</Text>
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
  },
  attribution: {
    position: "absolute",
    bottom: 4,
    right: 8,
    color: colors.textFaint,
    fontSize: 9,
  },
});
