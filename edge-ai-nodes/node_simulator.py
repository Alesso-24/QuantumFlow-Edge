"""
QuantumFlow Edge — Simulador de la flota de nodos IoT.

Replica en Python la lógica de edge_node.cpp para N nodos virtuales,
inyecta fugas aleatorias y reporta telemetría al backend cuántico.

Uso:
    python node_simulator.py [--nodes 12] [--leak-every 25]
"""
import argparse
import asyncio
import math
import random

import httpx

BACKEND = "http://localhost:8000"


class EdgeAnomalyDetector:
    """Mismo algoritmo que edge_node.cpp: EWMA + Welford + z-score."""

    def __init__(self, alpha: float = 0.15, threshold: float = 3.5, warmup: int = 30):
        self.alpha, self.threshold, self.warmup = alpha, threshold, warmup
        self.ewma = self.mean = self.m2 = 0.0
        self.count = 0

    def update(self, flow: float) -> tuple[float, bool]:
        self.ewma = flow if self.count == 0 else (
            self.alpha * flow + (1 - self.alpha) * self.ewma)
        self.count += 1
        delta = self.ewma - self.mean
        self.mean += delta / self.count
        self.m2 += delta * (self.ewma - self.mean)
        std = math.sqrt(self.m2 / (self.count - 1)) if self.count > 1 else 0.0
        z = abs(self.ewma - self.mean) / std if std > 1e-9 else 0.0
        return z, self.count > self.warmup and z > self.threshold


async def run_node(node_id: int, pipe_id: int, client: httpx.AsyncClient,
                   leak_probability: float) -> None:
    detector = EdgeAnomalyDetector()
    rng = random.Random(node_id)
    base_flow = rng.uniform(18, 32)
    leak_ticks_left = 0

    while True:
        flow = rng.gauss(base_flow, 0.8)
        if leak_ticks_left == 0 and rng.random() < leak_probability:
            leak_ticks_left = 40                      # nueva fuga
            print(f"💥 [nodo {node_id}] FUGA simulada en tubería {pipe_id}")
        if leak_ticks_left > 0:
            flow += 9.0
            leak_ticks_left -= 1

        z, is_anomaly = detector.update(flow)
        try:
            await client.post(f"{BACKEND}/telemetry", json={
                "node_id": node_id,
                "pipe_id": pipe_id,
                "flow_lps": round(flow, 2),
                "pressure_bar": round(rng.gauss(2.5, 0.1), 2),
                "anomaly_score": round(z, 2),
                "is_anomaly": is_anomaly,
            }, timeout=10)
        except httpx.HTTPError:
            pass  # backend aún no arriba; el nodo sigue midiendo (resiliencia edge)

        await asyncio.sleep(1.0)


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", type=int, default=12)
    parser.add_argument("--leak-every", type=float, default=120,
                        help="ticks promedio entre fugas espontáneas por nodo")
    args = parser.parse_args()

    async with httpx.AsyncClient() as client:
        print(f"🛰️  Levantando {args.nodes} nodos Edge → {BACKEND}")
        await asyncio.gather(*[
            run_node(i, pipe_id=i, client=client,
                     leak_probability=1.0 / args.leak_every)
            for i in range(args.nodes)
        ])


if __name__ == "__main__":
    asyncio.run(main())
