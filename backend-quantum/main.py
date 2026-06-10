"""
QuantumFlow Edge — Backend central (producto).

Red cargada de data/puebla_network.json: zonas reales de Puebla con
demandas estimadas de datos públicos (Agua de Puebla/SOAPAP/CONAGUA).

Flujo de datos:
  nodos edge  --POST /telemetry-->  [este servidor]  --WebSocket-->  paneles
                                          |
                                 quantum/qubo_optimizer
                                          |
                                  events.jsonl (auditoría)
"""
import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from quantum.water_network import WaterNetwork
from quantum.qubo_optimizer import optimize_network

VERSION = "1.3.0"
START_TIME = time.time()
EVENT_LOG = Path("events.jsonl")   # bitácora auditable, junto al ejecutable

app = FastAPI(
    title="QuantumFlow Edge Core",
    version=VERSION,
    description="Optimización cuántica de la red de agua potable de Puebla",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

network = WaterNetwork.from_json()
clients: set[WebSocket] = set()
total_liters_saved = 0.0
optimization_count = 0
optimization_lock = asyncio.Lock()


class Telemetry(BaseModel):
    node_id: int
    pipe_id: int
    flow_lps: float
    pressure_bar: float
    anomaly_score: float     # z-score normalizado calculado EN el nodo (Edge AI)
    is_anomaly: bool


def log_event(kind: str, payload: dict) -> None:
    """Bitácora JSONL: cada evento operativo queda auditable en disco."""
    record = {"ts": datetime.now(timezone.utc).isoformat(), "kind": kind, **payload}
    with EVENT_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def broadcast(message: dict) -> None:
    dead = set()
    for ws in clients:
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.add(ws)
    clients.difference_update(dead)


async def run_optimization(trigger: dict) -> dict:
    """Optimiza la red actual y difunde el resultado a todos los paneles."""
    global total_liters_saved, optimization_count
    async with optimization_lock:
        result = await asyncio.to_thread(optimize_network, network, "sa")
    total_liters_saved += result["liters_per_sec_saved"]
    optimization_count += 1
    log_event("optimization", {**trigger,
                               "energy": result["energy"],
                               "liters_per_sec_saved": result["liters_per_sec_saved"],
                               "solve_time_ms": result["solve_time_ms"]})
    await broadcast({
        "type": "optimization",
        "data": result,
        "network": network.to_dict(),
        "total_liters_saved": round(total_liters_saved, 1),
    })
    return result


@app.post("/telemetry")
async def receive_telemetry(t: Telemetry):
    """Los nodos edge solo reportan cuando SU modelo local detecta anomalía."""
    await broadcast({"type": "telemetry", "data": t.model_dump()})
    if t.is_anomaly:
        if not 0 <= t.pipe_id < len(network.pipes):
            raise HTTPException(404, f"pipe_id {t.pipe_id} no existe")
        network.report_anomaly(t.pipe_id, severity=min(t.anomaly_score / 5.0, 1.0))
        log_event("anomaly_detected", {"node_id": t.node_id, "pipe_id": t.pipe_id,
                                       "anomaly_score": t.anomaly_score})
        await run_optimization({"trigger": "edge_node", "pipe_id": t.pipe_id})
    return {"status": "ok"}


@app.post("/simulate/leak/{pipe_id}")
async def simulate_leak(pipe_id: int):
    """MODO PRUEBA: inyecta una fuga simulada (capacitación / validación)."""
    if not 0 <= pipe_id < len(network.pipes):
        raise HTTPException(404, f"pipe_id {pipe_id} no existe")
    fake = Telemetry(node_id=-1, pipe_id=pipe_id, flow_lps=0.0,
                     pressure_bar=0.0, anomaly_score=4.8, is_anomaly=True)
    log_event("simulated_leak", {"pipe_id": pipe_id})
    return await receive_telemetry(fake)


@app.post("/resolve/leak/{pipe_id}")
async def resolve_leak(pipe_id: int):
    """Marca una fuga como reparada por la cuadrilla y reoptimiza la red."""
    if not 0 <= pipe_id < len(network.pipes):
        raise HTTPException(404, f"pipe_id {pipe_id} no existe")
    network.clear_anomaly(pipe_id)
    log_event("leak_resolved", {"pipe_id": pipe_id})
    await run_optimization({"trigger": "leak_resolved", "pipe_id": pipe_id})
    return {"status": "ok"}


@app.get("/network")
async def get_network():
    return network.to_dict()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": VERSION,
        "uptime_s": round(time.time() - START_TIME, 1),
        "connected_panels": len(clients),
        "optimizations_run": optimization_count,
        "total_liters_saved": round(total_liters_saved, 1),
        "network": network.metadata.get("name", "desconocida"),
    }


@app.get("/events")
async def get_events(limit: int = 50):
    """Últimos eventos de la bitácora de auditoría."""
    if not EVENT_LOG.exists():
        return {"events": []}
    lines = EVENT_LOG.read_text(encoding="utf-8").strip().splitlines()
    return {"events": [json.loads(line) for line in lines[-limit:]]}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    await ws.send_text(json.dumps({"type": "network", "network": network.to_dict()}))
    try:
        while True:
            await ws.receive_text()   # keep-alive
    except WebSocketDisconnect:
        clients.discard(ws)
