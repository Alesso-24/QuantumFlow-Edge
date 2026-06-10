/**
 * Solver QUBO REAL en el cliente — puerto 1:1 de
 * backend-quantum/quantum/qubo_optimizer.py (misma matriz Q, mismo
 * Simulated Annealing, mismas λ).
 *
 * Lo usa el modo gemelo digital (web pública y APK sin backend): la
 * optimización que ves NO es una animación — es el mismo algoritmo del
 * core, ejecutándose en tu dispositivo sobre la red real de Puebla.
 */
import type { NetNode, NetPipe } from "../hooks/useQuantumFeed";

// Idénticas a qubo_optimizer.py — λ_d domina el peor costo de fuga
// ((0.13 + 0.45) × 700 ≈ 406) para que dejar una zona sin agua nunca
// sea "rentable" para el solver.
const LAMBDA_DEMAND = 2000.0;
const LAMBDA_REDUNDANCY = 25.0;
// Misma escala que WaterNetwork.report_anomaly: fuga extra = 0.45 × severidad
const ANOMALY_EXTRA_LEAK = 0.45;

export interface QuboResult {
  openPipes: number[];
  energy: number;
  convergence: number[];
  litersPerSecSaved: number;
  solveTimeMs: number;
  numQubits: number;
}

const effectiveLeak = (p: NetPipe, anomalies: Map<number, number>) =>
  p.leak_rate + ANOMALY_EXTRA_LEAK * (anomalies.get(p.id) ?? 0);

/** Construye la matriz Q simétrica — espejo de build_qubo(). */
export function buildQubo(
  nodes: NetNode[], pipes: NetPipe[], anomalies: Map<number, number>,
): number[][] {
  const n = pipes.length;
  const Q: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  // Pérdidas por fuga (lineal → diagonal)
  for (const p of pipes) Q[p.id][p.id] += effectiveLeak(p, anomalies) * p.capacity;

  // Cobertura de demanda: (1 − Σx_e)² = 1 − 2Σx_e + ΣΣ x_e x_f
  for (const v of nodes) {
    if (v.is_source || v.demand <= 0) continue;
    const edges = pipes.filter(p => p.target === v.id).map(p => p.id);
    for (const e of edges) Q[e][e] += LAMBDA_DEMAND * (-2.0 + 1.0);
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const coupling = LAMBDA_DEMAND + LAMBDA_REDUNDANCY;
        Q[edges[i]][edges[j]] += coupling;
        Q[edges[j]][edges[i]] += coupling;
      }
    }
  }
  return Q;
}

function energyOf(Q: number[][], x: Float64Array): number {
  let e = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i] === 0) continue;
    for (let j = 0; j < x.length; j++) e += Q[i][j] * x[j];
  }
  return e;
}

/** Simulated Annealing con single-bit-flips y ΔE en O(n) — espejo de solve_sa(). */
export function solveSA(
  Q: number[][], nSweeps = 250, nRestarts = 4,
): { x: Float64Array; energy: number; trace: number[] } {
  const n = Q.length;
  let bestX: Float64Array | null = null;
  let bestE = Infinity;
  const trace: number[] = [];

  for (let r = 0; r < nRestarts; r++) {
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = Math.random() < 0.5 ? 0 : 1;
    let e = energyOf(Q, x);
    const T0 = 8.0, Tf = 0.05;

    for (let sweep = 0; sweep < nSweeps; sweep++) {
      const T = T0 * Math.pow(Tf / T0, sweep / nSweeps);
      // permutación de Fisher–Yates (equivalente a rng.permutation)
      const order = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (const i of order) {
        let dot = 0;
        for (let j = 0; j < n; j++) dot += Q[i][j] * x[j];
        const delta = (1 - 2 * x[i]) * (Q[i][i] + 2 * (dot - Q[i][i] * x[i]));
        if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
          x[i] = 1 - x[i];
          e += delta;
        }
      }
      if (sweep % 20 === 0) trace.push(e);
    }
    if (e < bestE) { bestX = x.slice(); bestE = e; }
  }
  return { x: bestX!, energy: bestE, trace };
}

/**
 * Punto de entrada — espejo de optimize_network(), con la MISMA garantía
 * de producto que el CI verifica en el core: ninguna zona sin suministro.
 */
export function optimizeNetwork(
  nodes: NetNode[], pipes: NetPipe[], anomalies: Map<number, number>,
): QuboResult {
  const Q = buildQubo(nodes, pipes, anomalies);
  const t0 = Date.now();
  const { x, trace } = solveSA(Q);
  const solveTimeMs = Date.now() - t0;

  const open = new Set<number>();
  for (const p of pipes) if (x[p.id] > 0.5) open.add(p.id);

  // Invariante (cinturón y tirantes): si el SA dejara una zona sin entrada
  // — energéticamente casi imposible con λ_d = 2000 — se reabre su mejor tubería.
  for (const v of nodes) {
    if (v.is_source || v.demand <= 0) continue;
    const incoming = pipes.filter(p => p.target === v.id);
    if (incoming.length > 0 && !incoming.some(p => open.has(p.id))) {
      const best = incoming.reduce((a, b) =>
        effectiveLeak(a, anomalies) <= effectiveLeak(b, anomalies) ? a : b);
      open.add(best.id);
    }
  }

  let saved = 0;
  for (const p of pipes) {
    if (!open.has(p.id)) saved += effectiveLeak(p, anomalies) * p.capacity;
  }

  return {
    openPipes: [...open],
    energy: energyOf(Q, x),
    convergence: trace,
    litersPerSecSaved: +saved.toFixed(2),
    solveTimeMs,
    numQubits: Q.length,
  };
}
