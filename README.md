# 🌊 QuantumFlow Edge — Hackathon-LATAM 2026 (Puebla)

[![CI](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml)
[![APK Android](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml)
[![Demo Web](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml)

> **Optimización cuántica de redes hídricas urbanas con detección de anomalías en el borde (Edge AI).**
> Nodos IoT detectan fugas localmente → un core QUBO redirige el flujo de la ciudad en tiempo real → un dashboard multiplataforma muestra el ahorro hídrico en vivo.

## ⬇️ Descargas y demo

| Plataforma | Enlace |
|---|---|
| 🌐 **Demo online** (modo simulación, sin instalar nada) | https://alesso-24.github.io/QuantumFlow-Edge/ |
| 🤖 **APK Android** | [Releases](https://github.com/Alesso-24/QuantumFlow-Edge/releases) o artifact en [Actions](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml) |
| 🪟 **Windows .exe** (core cuántico standalone) | se compila con PyInstaller — ver [docs/BUILDS.md](docs/BUILDS.md) |
| 🍎 **iOS / iPadOS / macOS** | vía EAS Build / Expo Go — ver [docs/BUILDS.md](docs/BUILDS.md) |

---

## 📁 Estructura del Monorepo

```
QuantumFlow-Edge/
├── README.md                      ← Este archivo (plan + pitch)
├── backend-quantum/               ← Core cuántico (Python)
│   ├── requirements.txt
│   ├── main.py                    ← API FastAPI + WebSocket en tiempo real
│   └── quantum/
│       ├── __init__.py
│       ├── water_network.py       ← Modelo de grafo de la red hídrica
│       └── qubo_optimizer.py      ← Formulación QUBO + SA + QAOA (Qiskit)
├── edge-ai-nodes/                 ← Simulación de hardware IoT
│   ├── node_simulator.py          ← Orquestador de N nodos (Python)
│   ├── edge_node.cpp              ← Algoritmo de detección embebido (C++17)
│   └── CMakeLists.txt
└── multiplatform-app/             ← App universal (iOS/Android/Web/Desktop)
    ├── package.json
    ├── app.json
    ├── App.tsx                    ← Dashboard futurista
    └── src/
        ├── hooks/useQuantumFeed.ts ← WebSocket al backend
        ├── components/CityMap.tsx  ← Mapa SVG de la red en vivo
        └── components/SavingsPanel.tsx
```

---

## ⏱️ Plan de Ataque — 36 Horas

### FASE 0 · Horas 0–2 — Setup y contrato de datos
- Crear repos, entornos (`venv`, `npm install`), y **congelar el esquema JSON** entre las 3 capas (telemetría nodo→backend, resultado backend→app). *Esto es lo más importante: permite que los 3 módulos avancen en paralelo sin bloquearse.*

### FASE 1 · Horas 2–10 — El Core Cuántico (prioridad #1 para jueces)
- Modelar la red de Puebla como grafo (15–25 nodos es el sweet spot: suficiente para verse real, pequeño para que QAOA corra en simulador).
- Formular el QUBO (pérdidas + penalizaciones de demanda y capacidad).
- Implementar **doble solver**: Simulated Annealing (demo confiable, <1s) y QAOA con Qiskit (el "factor cuántico real" para la presentación técnica).
- ✅ Checkpoint hora 10: dado un JSON de fugas, el backend devuelve la reconfiguración óptima de válvulas.

### FASE 2 · Horas 10–18 — Edge AI + integración
- Simulador de nodos con inyección de fugas aleatorias y detección por z-score/EWMA **en el nodo** (no en el servidor — ese es el argumento Edge).
- Conectar nodos → FastAPI → optimizador → WebSocket broadcast.
- ✅ Checkpoint hora 18: pipeline completo corriendo end-to-end en terminal.

### FASE 3 · Horas 18–28 — El Frontend WOW (prioridad #2)
- Mapa SVG de la ciudad con tuberías que cambian de color (azul=normal, rojo=fuga, verde pulsante=ruta reoptimizada).
- Contador de litros ahorrados acumulados (animado — los jueces recuerdan números que suben).
- Panel "Quantum Core" mostrando la energía del QUBO convergiendo en vivo.
- ✅ Checkpoint hora 28: demo visual completa en web + un build móvil (Expo Go).

### FASE 4 · Horas 28–34 — Pulido y guion de demo
- Botón "💥 Inyectar fuga" para la demo en vivo (control total ante los jueces).
- Modo oscuro futurista, animaciones, logo.
- Ensayar el pitch 3 veces con cronómetro (5 min máx).

### FASE 5 · Horas 34–36 — Buffer y plan B
- Grabar un video de la demo funcionando (seguro ante fallos de WiFi del venue).
- Dormir 1 hora. En serio.

**Regla de oro de priorización:** si algo se atrasa, se recorta en este orden: builds nativos de escritorio → QAOA real (queda SA) → número de nodos. **Nunca** se recorta: el mapa en vivo, el contador de ahorro, ni el botón de inyectar fuga.

---

## 🚀 Cómo correr todo

```bash
# Terminal 1 — Backend cuántico
cd backend-quantum
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Nodos Edge
cd edge-ai-nodes
python node_simulator.py

# Terminal 3 — App multiplataforma
cd multiplatform-app
npm install
npx expo start          # móvil (Expo Go) y web con el MISMO código
```

---

## 🏆 El Pitch (resumen — guion completo al final de la sesión con Claude)

1. **El problema en números:** México pierde ~40% del agua potable en fugas. Puebla no es la excepción.
2. **La innovación:** la detección ocurre EN la tubería (Edge AI, sin nube, sin latencia) y la *respuesta* la calcula un optimizador cuántico, porque redirigir flujo en una red es un problema combinatorio NP-hard que explota exponencialmente — exactamente donde lo cuántico tiene ventaja.
3. **La demo:** inyectamos una fuga en vivo → el nodo la detecta en <1s → el QUBO reconfigura la red → el mapa se reorganiza ante sus ojos → el contador de litros ahorrados sube.
4. **Escalabilidad:** mismo código corre en el teléfono del operador de campo, la tablet del supervisor y el videowall del centro de control (un solo codebase React Native + Expo).
