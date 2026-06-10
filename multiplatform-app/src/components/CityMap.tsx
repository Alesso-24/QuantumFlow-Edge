/**
 * Mapa operativo de la red de agua potable de Puebla (coordenadas reales).
 *  - Tubería cian      → flujo normal
 *  - Tubería roja      → fuga detectada
 *  - Tubería apagada   → cerrada por el optimizador cuántico
 *  - Tocar una tubería → simular fuga (modo prueba)
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

const W = 1000;
const H = 640;
const PAD = 70;

export default function CityMap({ nodes, pipes, openPipes, onPipePress }: Props) {
  if (nodes.length === 0) return <View style={styles.container} />;

  // Proyección equirectangular simple: lon→x, lat→y (invertida para SVG)
  const lons = nodes.map(n => n.x);
  const lats = nodes.map(n => n.y);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const sx = (W - 2 * PAD) / (maxLon - minLon || 1);
  const sy = (H - 2 * PAD) / (maxLat - minLat || 1);

  const pos = (id: number) => {
    const n = nodes.find(n => n.id === id)!;
    return {
      x: PAD + (n.x - minLon) * sx,
      y: PAD + (maxLat - n.y) * sy,
    };
  };

  const shortName = (name: string) =>
    name.startsWith("Batería") ? "⚡ Pozos" : name.split("–")[0].split("(")[0].trim();

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
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
              strokeWidth={p.has_anomaly ? 6 : isOpen ? 3.5 : 1.5}
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
                r={n.is_source ? 16 : 9}
                fill={n.is_source ? "#FFD166" : "#0A1A33"}
                stroke={n.is_source ? "#FFD166" : "#00E5FF"}
                strokeWidth={2}
              />
              <SvgText x={x} y={y - 20} fill="#9FB6D4" fontSize={15}
                       fontWeight="600" textAnchor="middle">
                {shortName(n.name)}
              </SvgText>
              {!n.is_source && (
                <SvgText x={x} y={y + 26} fill="#5A7396" fontSize={11} textAnchor="middle">
                  {Math.round(n.demand)} L/s
                </SvgText>
              )}
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
