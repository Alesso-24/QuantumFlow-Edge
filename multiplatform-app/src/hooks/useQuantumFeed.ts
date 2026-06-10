/**
 * Hook de conexión en tiempo real al core cuántico.
 * Un solo WebSocket alimenta el mapa, el panel de ahorro y la traza QUBO.
 *
 * MODO DEMO: si el backend no está disponible (p. ej. la versión online en
 * GitHub Pages), el hook genera una simulación local equivalente para que
 * la demo nunca se vea muerta. La detección es automática.
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
  demoMode: boolean;
}

const initial: QuantumState = {
  nodes: [], pipes: [], openPipes: new Set(),
  totalSaved: 0, lastSolveMs: null, numQubits: null,
  convergence: [], connected: false, demoMode: false,
};

// ----------------------------------------------------------------------
// Simulación local (espejo de WaterNetwork.puebla_demo del backend)
// ----------------------------------------------------------------------
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDemoNetwork(): { nodes: NetNode[]; pipes: NetPipe[] } {
  const rng = mulberry32(42);
  const nodes: NetNode[] = [];
  for (let i = 0; i < 16; i++) {
    nodes.push({
      id: i,
      x: (i % 4) + (rng() - 0.5) * 0.4,
      y: Math.floor(i / 4) + (rng() - 0.5) * 0.4,
      demand: i < 2 ? 0 : 8 + rng() * 22,
      is_source: i < 2,
    });
  }
  const pipes: NetPipe[] = [];
  let pid = 0;
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (dx * dx + dy * dy <= 2.2) {
        pipes.push({
          id: pid++, source: i, target: j,
          capacity: 40 + rng() * 50,
          leak_rate: 0.01 + rng() * 0.04,
          has_anomaly: false,
        });
      }
    }
  }
  return { nodes, pipes };
}

export function useQuantumFeed(): QuantumState & { injectLeak: (id: number) => void } {
  const [state, setState] = useState<QuantumState>(initial);
  const wsRef = useRef<WebSocket | null>(null);
  const demoRef = useRef(false);

  // --- Simulación de una "optimización" en modo demo ---
  const simulateOptimization = (pipeId: number) => {
    setState(s => {
      if (s.pipes.length === 0) return s;
      const pipes = s.pipes.map(p => ({ ...p, has_anomaly: p.id === pipeId }));
      const open = new Set<number>(pipes.map(p => p.id));
      open.delete(pipeId);                       // el "QUBO" aísla la fuga
      pipes.filter(() => Math.random() < 0.15)   // y poda rutas redundantes
        .forEach(p => { if (p.id !== pipeId) open.delete(p.id); });
      const saved = pipes.filter(p => !open.has(p.id))
        .reduce((acc, p) => acc + p.leak_rate * p.capacity, 0) + 25;
      const trace = Array.from({ length: 13 }, (_, i) =>
        -600 * (1 - Math.exp(-i / 3)) + Math.random() * 40);
      return {
        ...s, pipes, openPipes: open,
        totalSaved: +(s.totalSaved + saved).toFixed(1),
        lastSolveMs: +(550 + Math.random() * 350).toFixed(1),
        numQubits: pipes.length,
        convergence: trace,
      };
    });
  };

  useEffect(() => {
    let alive = true;
    let failures = 0;
    let demoTimer: ReturnType<typeof setInterval> | null = null;

    const enterDemoMode = () => {
      if (demoRef.current || !alive) return;
      demoRef.current = true;
      const net = buildDemoNetwork();
      setState(s => ({
        ...s, ...net,
        openPipes: new Set(net.pipes.map(p => p.id)),
        connected: true, demoMode: true,
      }));
      // Fuga espontánea cada ~9 s para que la pantalla siempre respire
      demoTimer = setInterval(() => {
        simulateOptimization(Math.floor(Math.random() * net.pipes.length));
      }, 9000);
    };

    const connect = () => {
      if (demoRef.current) return;
      let ws: WebSocket;
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        enterDemoMode();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => { failures = 0; setState(s => ({ ...s, connected: true })); };
      ws.onclose = () => {
        setState(s => ({ ...s, connected: false }));
        if (!alive) return;
        failures += 1;
        if (failures >= 3) enterDemoMode();   // backend inalcanzable → demo
        else setTimeout(connect, 2000);
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
    return () => {
      alive = false;
      if (demoTimer) clearInterval(demoTimer);
      wsRef.current?.close();
    };
  }, []);

  const injectLeak = (pipeId: number) => {
    if (demoRef.current) {
      simulateOptimization(pipeId);
    } else {
      fetch(`${API_URL}/demo/inject-leak/${pipeId}`, { method: "POST" }).catch(() => {});
    }
  };

  return { ...state, injectLeak };
}
