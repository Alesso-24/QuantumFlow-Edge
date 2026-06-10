"""
Launcher del ejecutable QuantumFlowCore.exe (PyInstaller).

Arranca el backend completo (API + WebSocket + optimizador QUBO) sin
necesitar Python instalado: doble clic y la demo está en línea.
"""
import sys

import uvicorn

from main import app

if sys.stdout and sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print("=" * 60)
    print("  QuantumFlow Edge - Core Cuantico")
    print(f"  API:       http://localhost:{port}")
    print(f"  WebSocket: ws://localhost:{port}/ws")
    print("  Ctrl+C para detener")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
