/**
 * Hook de conexión en tiempo real al core cuántico.
 * Un solo WebSocket alimenta el mapa, el panel de ahorro y la traza QUBO.
 */
import { useEffect, useRef, useState } from "react";

// En demo local: localhost. En el venue: IP de la laptop que corre el backend.
const WS_URL = "ws://localhost:8000/ws";
const API_URL = "http://localhost:8000";

export interface NetNode {
  id: number;
  x: number;
  y: number;
  demand: number;
  is_source: boolean;
}

export interface NetPipe {
  id: number;
  source: number;
  target: number;
  capacity: number;
  leak_rate: number;
  has_anomaly: boolean;
}

export interface QuantumState {
  nodes: NetNode[];
  pipes: NetPipe[];
  openPipes: Set<number>;
  totalSaved: number;
  lastSolveMs: number | null;
  numQubits: number | null;
  convergence: number[];
  connected: boolean;
}

const initial: QuantumState = {
  nodes: [], pipes: [], openPipes: new Set(),
  totalSaved: 0, lastSolveMs: null, numQubits: null,
  convergence: [], connected: false,
};

export function useQuantumFeed(): QuantumState & { injectLeak: (id: number) => void } {
  const [state, setState] = useState<QuantumState>(initial);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let alive = true;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setState(s => ({ ...s, connected: true }));
      ws.onclose = () => {
        setState(s => ({ ...s, connected: false }));
        if (alive) setTimeout(connect, 2000); // reconexión automática
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "network") {
          setState(s => ({
            ...s,
            nodes: msg.network.nodes,
            pipes: msg.network.pipes,
            openPipes: new Set(msg.network.pipes.map((p: NetPipe) => p.id)),
          }));
        } else if (msg.type === "optimization") {
          setState(s => ({
            ...s,
            nodes: msg.network.nodes,
            pipes: msg.network.pipes,
            openPipes: new Set(msg.data.open_pipes),
            totalSaved: msg.total_liters_saved,
            lastSolveMs: msg.data.solve_time_ms,
            numQubits: msg.data.num_qubits,
            convergence: msg.data.convergence_trace,
          }));
        }
      };
    };

    connect();
    return () => { alive = false; wsRef.current?.close(); };
  }, []);

  const injectLeak = (pipeId: number) => {
    fetch(`${API_URL}/demo/inject-leak/${pipeId}`, { method: "POST" }).catch(() => {});
  };

  return { ...state, injectLeak };
}
