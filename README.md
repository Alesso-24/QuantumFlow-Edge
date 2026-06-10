<div align="center">

# ⚛️💧 QuantumFlow Edge

### El agua de Puebla, optimizada con computación cuántica

**De cada 10 litros que produce la ciudad, 4 nunca llegan a una llave.**
Este sistema encuentra las fugas en segundos y reorganiza la red automáticamente —
sin dejar a ninguna colonia sin agua.

[![CI](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml)
[![APK Android](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml)
[![Demo Web](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml)

### 👉 [**PRUÉBALO AHORA — sin instalar nada**](https://alesso-24.github.io/QuantumFlow-Edge/) 👈

*(Abre la pestaña "Red en vivo" y toca cualquier tubería para simular una fuga)*

</div>

---

## ¿Qué es esto, en 30 segundos?

| | |
|---|---|
| 🛰️ **Sensores que piensan** | Nodos de <$200 MXN dentro de las tuberías detectan fugas en <1 s, sin internet ni nube (Edge AI en C++). |
| ⚛️ **Decisión cuántica** | Con 31 válvulas hay 2³¹ ≈ 2,000 millones de jugadas posibles. Un optimizador QUBO encuentra la mejor en <1 s, con una regla matemática inquebrantable: **ninguna colonia se queda sin agua**. |
| 📱 **Una app para todo** | El mismo código corre en iOS, Android, web y escritorio. Mapa real de Puebla (OpenStreetMap), clima en vivo, bitácora auditable. |

**Datos**: las cifras de la red son **reales y públicas** (Agua de Puebla/SOAPAP/CONAGUA),
el clima es **real en vivo** (Open-Meteo), las demandas por sector son **estimadas** con
metodología abierta, y la telemetría es **simulada** (gemelo digital) hasta desplegar
hardware. Cada número lleva su etiqueta: [docs/DATA.md](docs/DATA.md).

## ⬇️ Pruébalo

| Plataforma | Cómo |
|---|---|
| 🌐 Web (recomendado para empezar) | [alesso-24.github.io/QuantumFlow-Edge](https://alesso-24.github.io/QuantumFlow-Edge/) |
| 🤖 Android | Descarga el APK desde [Releases](https://github.com/Alesso-24/QuantumFlow-Edge/releases) |
| 🪟 Windows (core completo, sin Python) | Compila `QuantumFlowCore.exe` → [docs/BUILDS.md](docs/BUILDS.md) |
| 🍎 iOS / iPadOS / macOS | Expo Go o EAS Build → [docs/BUILDS.md](docs/BUILDS.md) |

## 🗂️ El repositorio en un vistazo

```
QuantumFlow-Edge/
├── backend-quantum/        ⚛️ El cerebro (Python)
│   ├── quantum/            QUBO + Simulated Annealing + QAOA (Qiskit)
│   ├── data/               Red REAL de Puebla (16 sectores, 203 pozos → 3 baterías)
│   ├── main.py             API + WebSocket + bitácora de auditoría
│   └── test_e2e.py         Prueba de extremo a extremo
├── edge-ai-nodes/          🛰️ Los sentidos
│   ├── edge_node.cpp       Firmware del sensor (C++17, listo para ESP32)
│   └── node_simulator.py   Gemelo digital de la flota de sensores
├── multiplatform-app/      📱 La cara (Expo / React Native)
│   └── src/screens/        Inicio · Red en vivo · Cómo funciona · Datos
└── docs/                   📚 DATA (trazabilidad) · ARCHITECTURE · BUILDS · PITCH
```

## 🚀 Correr el sistema completo en tu máquina

```bash
# 1. El cerebro
cd backend-quantum
python -m venv .venv && .venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn main:app --port 8000

# 2. Los sentidos (otra terminal)
cd edge-ai-nodes
python node_simulator.py

# 3. La cara (otra terminal)
cd multiplatform-app
npm install
npx expo start --web        # añade ?server=TU_IP:8000 para conectar otros dispositivos
```

API del core: `GET /health` · `GET /network` · `GET /events` · `POST /telemetry` ·
`POST /simulate/leak/{id}` · `POST /resolve/leak/{id}` · `WS /ws`

## 📚 Para profundizar

- **[docs/DATA.md](docs/DATA.md)** — qué dato es real, cuál estimado, cuál simulado (con fuentes)
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — el diagrama completo y el flujo de un evento de fuga
- **[docs/BUILDS.md](docs/BUILDS.md)** — compilar para cada plataforma + ruta a las tiendas
- **[docs/PITCH.md](docs/PITCH.md)** — la presentación ejecutiva

## 🗺️ Hoja de ruta a despliegue real

| Fase | Alcance | Estado |
|---|---|---|
| 1. Software + gemelo digital | Este repositorio completo, con CI/CD | ✅ |
| 2. Piloto de hardware | 31 nodos ESP32 en un sector (el firmware ya existe) | Requiere convenio con el operador |
| 3. Catastro real | Sustituir capacidades estimadas por el catastro troncal de SOAPAP | Requiere datos del operador |
| 4. Actuación física | Válvulas motorizadas consumiendo el plan del QUBO | Integración industrial estándar |
| 5. Escala cuántica | Red completa (>10⁴ válvulas) en QPU real — misma matriz Q | Formulación ya agnóstica |

---

<div align="center">
<sub>Hackathon-LATAM 2026 · Computación cuántica para los desafíos del agua · Puebla, México</sub>
</div>
