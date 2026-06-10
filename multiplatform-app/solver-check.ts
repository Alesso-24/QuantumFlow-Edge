/**
 * Verificación del solver QUBO del cliente (corre en CI: `npx tsx solver-check.ts`).
 *
 * Espejo del smoke test Python (python -m quantum.qubo_optimizer): misma fuga
 * (tubería 6, severidad 0.9) y el MISMO invariante de producto — ninguna de
 * las 16 zonas puede quedar sin suministro. Referencia de paridad: el core
 * Python reporta energía ≈ −31287 y ahorro ≈ 517 L/s para este escenario.
 */
import { PUEBLA_NODES, PUEBLA_PIPES } from "./src/data/pueblaNetwork";
import { optimizeNetwork, buildQubo } from "./src/quantum/quboSolver";

const anomalies = new Map([[6, 0.9]]); // misma fuga del smoke test Python

const Q = buildQubo(PUEBLA_NODES, PUEBLA_PIPES, anomalies);
console.log(`Red Puebla: ${PUEBLA_NODES.length} sectores, ${PUEBLA_PIPES.length} tuberias (qubits)`);

for (let run = 0; run < 5; run++) {
  const r = optimizeNetwork(PUEBLA_NODES, PUEBLA_PIPES, anomalies);
  const open = new Set(r.openPipes);
  let violations = 0;
  for (const v of PUEBLA_NODES) {
    if (v.is_source || v.demand <= 0) continue;
    if (!PUEBLA_PIPES.some(p => p.target === v.id && open.has(p.id))) {
      violations++;
      console.log(`  VIOLACION: ${v.name} sin suministro`);
    }
  }
  console.log(
    `run ${run + 1}: energia=${r.energy.toFixed(1)} ahorro=${r.litersPerSecSaved} L/s ` +
    `t=${r.solveTimeMs} ms qubits=${r.numQubits} violaciones=${violations}`,
  );
  if (violations > 0) process.exit(1);
}
console.log("OK: las 16 zonas conservan suministro en las 5 corridas");
