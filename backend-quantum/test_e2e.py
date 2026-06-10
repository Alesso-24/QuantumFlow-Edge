"""Prueba end-to-end: WebSocket + inyección de fuga + optimización QUBO.

Uso: python test_e2e.py   (con el backend corriendo en :8000)
"""
import asyncio
import json
import sys

import httpx
import websockets

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")


async def main() -> int:
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        first = json.loads(await ws.recv())
        assert first["type"] == "network", f"esperaba 'network', llegó {first['type']}"
        print(f"✅ WS conectado: red de {len(first['network']['nodes'])} nodos")

        async with httpx.AsyncClient() as client:
            await client.post("http://localhost:8000/demo/inject-leak/7")

        # La fuga debe producir telemetría + resultado de optimización
        seen = set()
        while {"telemetry", "optimization"} - seen:
            msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=30))
            seen.add(msg["type"])
            if msg["type"] == "optimization":
                d = msg["data"]
                print(f"✅ Optimización QUBO recibida por WS: {d['num_qubits']} qubits, "
                      f"{d['liters_per_sec_saved']} L/s ahorrados en {d['solve_time_ms']} ms")
                print(f"✅ Ahorro total acumulado: {msg['total_liters_saved']} L/s")
    print("✅ E2E COMPLETO: nodos → backend → QUBO → WebSocket → app")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
