# 📊 Trazabilidad de Datos — qué es real, qué es estimado, qué es simulado

Principio del producto: **cada número tiene etiqueta**. Nada simulado se presenta como real.

## ✅ DATOS REALES (fuentes públicas verificables)

| Dato | Valor | Fuente |
|---|---|---|
| Caudal total entregado por Agua de Puebla | **3,718 L/s** (abril 2026) | [Agua de Puebla](https://www.aguapuebla.mx/agua-de-puebla-incremento-la-disponibilidad-de-3-millones-de-litros-de-agua-adicionales-para-mejorar-el-servicio-a-las-familias-poblanas/), [Diario Puntual](https://www.diariopuntual.com/ciudad/2026/04/12/3712/agua-de-puebla-aumenta-en-3-millones-de-litros-el-suministro-para-fortalecer) |
| Población servida | **1,812,000 habitantes** en **963 colonias** | Agua de Puebla (ibid.) |
| Pérdidas totales de la red | **40–41%** del agua extraída | [Periódico Central](https://www.periodicocentral.mx/municipios/por-fugas-y-huachicoleo-se-pierde-mas-del-40-del-liquido-agua-de-puebla/468849/), [Telediario](https://www.telediario.mx/comunidad/puebla-pierde-41-por-ciento-de-agua-por-fugas-y-huachicol), [SOAPAP](https://www.ambasmanos.mx/politica/soapap-revela-que-el-40-del-agua-que-se-extrae-en-puebla-se-pierde/317727/) |
| Desglose de pérdidas | **21% fugas físicas** (~20 Mm³/año) + **20% tomas no registradas** | Periódico Central (ibid.) |
| Fuente de abastecimiento | **203 pozos profundos** del Acuífero del Valle de Puebla | [CONAGUA DR-2104](https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/puebla/DR_2104.pdf) |
| Declive del acuífero | caudal de pozos cayendo **3.8%** (~150 L/s) | El Universal Puebla / Agua de Puebla |
| Continuidad del servicio | solo **135 de 963 colonias** con agua 24 h | SOAPAP (ibid.) |
| Nombres y coordenadas de los 16 sectores y 3 baterías | geografía real de la ciudad de Puebla | cartografía pública |

## 🟡 DATOS ESTIMADOS (derivados de los reales — metodología abierta)

| Dato | Metodología |
|---|---|
| Población por sector | Distribución del 1.81M total entre 16 agrupaciones de colonias, ponderada por extensión y densidad conocida de cada zona. **No es un censo por sector.** |
| Demanda por nodo (L/s) | `población × 130 L/hab/día de consumo efectivo ÷ 86,400 s`. Total resultante: 2,430 L/s ≈ 65% del caudal producido — consistente con el ~40% de pérdidas reportado. |
| Capacidad de tuberías troncales (200–700 L/s) | Jerarquía típica de redes primarias urbanas; SOAPAP no publica el catastro de su red troncal. |
| Tasa de fuga por tramo (`base_leak` 0.06–0.13) | **Calibrada** para que la pérdida física de toda la red reproduzca el ~21% reportado. |
| Agrupación de los 203 pozos en 3 baterías | Simplificación topológica (norte / oriente / sur-poniente) para el modelo de optimización. |

## 🔴 DATOS SIMULADOS (y por qué)

| Dato | Estado |
|---|---|
| Telemetría de sensores (flujo/presión) | **Simulada por el gemelo digital.** No hay hardware desplegado: el plan de despliegue contempla nodos ESP32 (<$10 USD c/u) cuyo firmware ya existe en `edge-ai-nodes/edge_node.cpp` con el mismo algoritmo que el simulador. |
| Eventos de fuga | Generados en modo prueba (`/simulate/leak`) o por el gemelo digital. Las fugas REALES de Puebla existen (21% del caudal) pero no están georreferenciadas públicamente. |

> **Qué NO es simulado**: la optimización. Incluso la demo online y el APK sin
> backend resuelven el QUBO real (misma matriz Q y mismo Simulated Annealing del
> core Python, portado 1:1 a `multiplatform-app/src/quantum/quboSolver.ts`) en el
> dispositivo del visitante. El CI verifica la paridad TS↔Python y el invariante
> "ninguna zona sin suministro" en cada commit (`solver-check.ts`).
| Acción sobre válvulas | El resultado del QUBO es un plan de válvulas; el actuador físico (válvulas motorizadas + PLC) es la fase de implementación con el organismo operador. |

## El número que importa

Si el sistema redujera las fugas físicas de 21% a 14% (una tercera parte, meta conservadora
para detección temprana), la ciudad recuperaría **~260 L/s ≈ 22,500 m³/día ≈ 2,250 pipas
diarias** — agua para ~170,000 habitantes al nivel de consumo actual, sin perforar un solo
pozo nuevo en un acuífero que ya declina 3.8% anual.
