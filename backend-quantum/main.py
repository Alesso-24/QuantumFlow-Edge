"""
QuantumFlow Edge — Backend central.

Flujo de datos:
  edge-ai-nodes  --POST /telemetry-->  [este servidor]  --WebSocket-->  app
                                            |
                                   quantum/qubo_optimizer
"""
import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from quantum.water_network import WaterNetwork
from quantum.qubo_optimizer import optimize_network

app = FastAPI(title="QuantumFlow Edge Core")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

network = WaterNetwork.puebla_demo()
clients: set[WebSocket] = set()
total_liters_saved = 0.0
optimization_lock = asyncio.Lock()


class Telemetry(BaseModel):
    node_id: int
    pipe_id: int
    flow_lps: float
    pressure_bar: float
    anomaly_score: float     # z-score normalizado calculado EN el nodo (Edge AI)
    is_anomaly: bool


async def broadcast(message: dict) -> None:
    dead = set()
    for ws in clients:
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.add(ws)
    clients.difference_update(dead)


@app.post("/telemetry")
async def receive_telemetry(t: Telemetry):
    """Los nodos Edge solo reportan cuando SU modelo local detecta anomalía
    (eso es lo que ahorra ancho de banda — argumento clave del pitch)."""
    global total_liters_saved

    await broadcast({"type": "telemetry", "data": t.model_dump()})

    if t.is_anomaly:
        network.report_anomaly(t.pipe_id, severity=min(t.anomaly_score / 5.0, 1.0))
        async with optimization_lock:
            result = await asyncio.to_thread(optimize_network, network, "sa")
        total_liters_saved += result["liters_per_sec_saved"]
        await broadcast({
            "type": "optimization",
            "data": result,
            "network": network.to_dict(),
            "total_liters_saved": round(total_liters_saved, 1),
        })
    return {"status": "ok"}


@app.post("/demo/inject-leak/{pipe_id}")
async def inject_leak(pipe_id: int):
    """Botón '💥 Inyectar fuga' de la demo ante los jueces."""
    fake = Telemetry(node_id=99, pipe_id=pipe_id, flow_lps=12.0,
                     pressure_bar=1.1, anomaly_score=4.8, is_anomaly=True)
    return await receive_telemetry(fake)


@app.get("/network")
async def get_network():
    return network.to_dict()


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
