# 🎤 Guion del Pitch — 5 minutos para ganar

## Estructura (cronometrada)

### 0:00–0:40 · El gancho
> "Mientras estuvimos en este hackathon, la zona metropolitana de Puebla perdió
> millones de litros de agua potable en fugas que nadie vio. México pierde ~40% del
> agua que potabiliza. No es un problema de tuberías viejas: es un problema de
> **decisión en tiempo real**. Y decidir cómo redirigir el agua de una ciudad entera
> es un problema que explota exponencialmente. Exactamente el tipo de problema
> para el que nació la computación cuántica."

### 0:40–1:30 · La arquitectura en 3 frases
1. "Nodos de **10 dólares** en las tuberías detectan la fuga EN el lugar, con
   estadística embebida en C++ — sin nube, sin latencia." *(mostrar edge_node.cpp)*
2. "Un core cuántico recibe el grafo herido de la ciudad y resuelve un QUBO de 32
   qubits: qué válvulas cerrar para aislar la fuga **sin dejar a ninguna colonia
   sin agua**." *(mostrar el panel Quantum Core)*
3. "Y el mismo código de interfaz corre en el teléfono del fontanero, la tablet del
   supervisor y el videowall del centro de control."

**La frase que une todo: "La inteligencia vive en la tubería; la estrategia vive en el qubit."**

### 1:30–3:30 · LA DEMO EN VIVO (el momento WOW)
- Pantalla grande: dashboard con la red fluyendo en azul.
- **Desde el teléfono**, tocar una tubería → "💥 Inyectar fuga".
- Narrar EN ORDEN lo que se ve: "El nodo la detectó… el QUBO está optimizando —
  vean la energía converger — … y la red acaba de reorganizarse. Ese contador son
  los litros que la ciudad deja de perder **cada segundo**."
- Inyectar una SEGUNDA fuga simultánea: "Con dos fugas el espacio de decisión ya
  tiene 4 mil millones de combinaciones. Tardó 800 milisegundos."

### 3:30–4:20 · Honestidad técnica (gana credibilidad con jueces expertos)
> "Hoy el solver corre Simulated Annealing y QAOA sobre simulador Qiskit. ¿Por qué
> no una QPU en vivo? Porque una demo no debe depender de la cola de IBM Quantum.
> Pero la formulación QUBO es agnóstica al hardware: la MISMA matriz Q se sube a
> una QPU real sin cambiar una línea. Esa es la diferencia entre quantum-washing
> y arquitectura cuántica de verdad."

### 4:20–5:00 · Escala y cierre
- "Todo es open source, con CI que compila el APK y despliega la demo web en cada commit."
- "Escanéen este QR: la demo corre en SUS teléfonos ahora mismo." *(QR al GitHub Pages)*
- Cierre: "El agua de Puebla no necesita más sensores que recolecten datos.
  Necesita decisiones en milisegundos. Eso es QuantumFlow Edge."

## Preguntas previsibles del jurado (y la respuesta)

| Pregunta | Respuesta |
|---|---|
| "¿Ventaja cuántica real?" | "En 32 qubits, ninguna — lo decimos abierto. La ventaja aparece al escalar: una red real tiene >10⁴ válvulas y el QUBO crece cuadrático, no exponencial. Nuestra arquitectura ya está lista para ese hardware." |
| "¿Por qué no un solver clásico (Gurobi)?" | "Para esta demo sería equivalente. Pero el annealing cuántico muestrea soluciones diversas casi-óptimas en redes con incertidumbre — y el costo marginal de nuestro diseño dual-solver es cero." |
| "¿Falsos positivos de los nodos?" | "Warmup de 30 muestras + EWMA + umbral z=3.5 → tasa de falsa alarma <0.05%. Y una falsa alarma solo cuesta una reoptimización de 1 segundo, no una excavación." |
| "¿Cómo se actúa físicamente?" | "El mensaje de válvulas del WebSocket es el mismo que recibiría un PLC con válvulas motorizadas — estándar en redes modernas. El eslabón actuador ya existe en la industria." |

## Checklist del día de la demo
- [ ] Backend corriendo ANTES de subir al escenario (`QuantumFlowCore.exe`)
- [ ] Teléfono y laptop en el MISMO WiFi (o hotspot propio — no confiar en el WiFi del venue)
- [ ] Cambiar `WS_URL` en la app a la IP de la laptop
- [ ] Video de respaldo grabado por si todo falla
- [ ] QR impreso al demo online de GitHub Pages
