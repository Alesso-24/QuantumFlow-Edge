/**
 * Mapa en vivo de la red hídrica de Puebla.
 *  - Tubería cian      → flujo normal
 *  - Tubería roja      → fuga detectada por el nodo Edge
 *  - Tubería apagada   → cerrada por el optimizador cuántico
 *  - Tocar una tubería → inyectar fuga (la demo ante los jueces)
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { NetNode, NetPipe } from "../hooks/useQuantumFeed";

interface Props {
  nodes: NetNode[];
  pipes: NetPipe[];
  openPipes: Set<number>;
  onPipePress: (pipeId: number) => void;
}

const SCALE = 110;
const PAD = 50;

export default function CityMap({ nodes, pipes, openPipes, onPipePress }: Props) {
  if (nodes.length === 0) return <View style={styles.container} />;

  const pos = (id: number) => {
    const n = nodes.find(n => n.id === id)!;
    return { x: PAD + n.x * SCALE, y: PAD + n.y * SCALE };
  };
  const width = PAD * 2 + Math.max(...nodes.map(n => n.x)) * SCALE;
  const height = PAD * 2 + Math.max(...nodes.map(n => n.y)) * SCALE;

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {pipes.map(p => {
          const a = pos(p.source);
          const b = pos(p.target);
          const isOpen = openPipes.has(p.id);
          const color = p.has_anomaly ? "#FF3B5C" : isOpen ? "#00E5FF" : "#1A2940";
          return (
            <Line
              key={p.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={color}
              strokeWidth={p.has_anomaly ? 5 : isOpen ? 3 : 1.5}
              strokeDasharray={isOpen ? undefined : "6 6"}
              opacity={isOpen || p.has_anomaly ? 1 : 0.5}
              onPress={() => onPipePress(p.id)}
            />
          );
        })}
        {nodes.map(n => {
          const { x, y } = pos(n.id);
          return (
            <React.Fragment key={n.id}>
              <Circle
                cx={x} cy={y}
                r={n.is_source ? 14 : 8}
                fill={n.is_source ? "#FFD166" : "#0A1A33"}
                stroke={n.is_source ? "#FFD166" : "#00E5FF"}
                strokeWidth={2}
              />
              <SvgText x={x} y={y - 18} fill="#7A93B8" fontSize={10} textAnchor="middle">
                {n.is_source ? "⚡ Planta" : `N${n.id}`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08101F",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#13233D",
    overflow: "hidden",
  },
});
