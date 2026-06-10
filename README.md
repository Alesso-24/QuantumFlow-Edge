# 🌊 QuantumFlow Edge

[![CI](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/ci.yml)
[![APK Android](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/build-android.yml)
[![Demo Web](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/Alesso-24/QuantumFlow-Edge/actions/workflows/deploy-web.yml)

**Plataforma de reducción de pérdidas de agua para la ciudad de Puebla**: detección de
fugas en el borde (Edge AI) + redirección óptima del flujo mediante optimización
cuántica (QUBO) + centro de control multiplataforma.

> Desarrollado para el *Hackathon-LATAM 2026: Computación cuántica para los desafíos
> del agua* — diseñado como producto operable, no como prototipo de exhibición.

## El problema (datos reales, fuentes en [docs/DATA.md](docs/DATA.md))

La zona de cobertura de Agua de Puebla/SOAPAP entrega **3,718 L/s** desde **203 pozos**
de un acuífero que declina **3.8% anual**, a **1.81 millones de habitantes**. De esa
agua, **40–41% se pierde**: 21% en fugas físicas (~20 millones de m³/año) y 20% en tomas
no registradas. Solo 135 de 963 colonias tienen servicio 24 horas.

**Lo que este producto ataca:** el 21% de fugas físicas. Detectarlas hoy depende de
reportes ciudadanos (días o semanas); aquí se detectan en segundos y la red se
reconfigura sola para contenerlas sin dejar a ninguna zona sin suministro.
Reducir las fugas físicas a 14% recuperaría **~22,500 m³/día** — agua para ~170,000
personas sin perforar un pozo nuevo.

## Cómo funciona

1. **Nodos Edge** (firmware C++17 listo para ESP32, <$10 USD/nodo) calculan estadística
   de flujo *en la tubería* (EWMA + Welford + z-score). Solo transmiten al detectar
   anomalía: ancho de banda ≈ 0, operan sin internet.
2. **Core cuántico** (Python): la red troncal de Puebla —16 sectores reales, 3 baterías
   de pozos, 31 tuberías— se modela como QUBO de 31 qubits. El solver (Simulated
   Annealing <1 s, o QAOA/Qiskit con la misma matriz) decide qué válvulas cerrar para
   aislar la fuga **garantizando que ninguna zona pierda suministro** (invariante
   verificado en CI).
3. **Centro de control** (Expo/React Native): el mismo código corre en iOS, Android,
   web y escritorio. Mapa geográfico real, ahorro en L/s, m³/día y pipas equivalentes,
   bitácora auditable. Servidor configurable con `?server=IP:8000`.

Si no hay backend alcanzable, la app opera como **gemelo digital** de la red real
(claramente etiquetado) — así funciona la [versión web pública](https://alesso-24.github.io/QuantumFlow-Edge/).

## ⬇️ Obtener el producto

| Plataforma | Enlace |
|---|---|
| 🌐 **Web** (gemelo digital, sin instalar) | https://alesso-24.github.io/QuantumFlow-Edge/ |
| 🤖 **Android (APK)** | [Releases](https://github.com/Alesso-24/QuantumFlow-Edge/releases) |
| 🪟 **Windows** (`QuantumFlowCore.exe`, backend completo standalone) | compilar con PyInstaller — [docs/BUILDS.md](docs/BUILDS.md) |
| 🍎 **iOS / iPadOS / macOS** | EAS Build / Expo Go — [docs/BUILDS.md](docs/BUILDS.md) |

## 🚀 Operación local completa

```bash
# Terminal 1 — Core cuántico (o doble clic a QuantumFlowCore.exe)
cd backend-quantum
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000

# Terminal 2 — Flota de sensores (gemelo digital de los 31 puntos de medición)
cd edge-ai-nodes
python node_simulator.py

# Terminal 3 — Centro de control
cd multiplatform-app
npm install
npx expo start          # móvil (Expo Go), web y escritorio con el MISMO código
```

API del core: `GET /health` · `GET /network` · `GET /events` (auditoría) ·
`POST /telemetry` · `POST /simulate/leak/{id}` (modo prueba) · `POST /resolve/leak/{id}` · `WS /ws`

## 📚 Documentación

- [docs/DATA.md](docs/DATA.md) — **trazabilidad de datos**: qué es real, qué es estimado, qué es simulado (con fuentes)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura, flujo de un evento de fuga, contratos de datos
- [docs/BUILDS.md](docs/BUILDS.md) — builds por plataforma y rutas a Play Store / App Store
- [docs/PITCH.md](docs/PITCH.md) — presentación ejecutiva del producto

## 🗺️ Hoja de ruta a despliegue real

| Fase | Alcance | Estado |
|---|---|---|
| 1. Software + gemelo digital | Este repositorio: optimizador, API, app, CI/CD | ✅ Hecho |
| 2. Piloto de hardware | 31 nodos ESP32 con el firmware de `edge-ai-nodes/` en un sector (p. ej. La Margarita) | Firmware listo; requiere convenio con el organismo operador |
| 3. Catastro real de red | Sustituir capacidades estimadas por el catastro troncal de SOAPAP | Requiere datos del operador |
| 4. Actuación física | Válvulas motorizadas/PLC consumiendo el plan del QUBO | Integración estándar industrial |
| 5. Escala cuántica | Red completa (>10⁴ válvulas) sobre QPU real — misma matriz Q | La formulación ya es agnóstica al hardware |
