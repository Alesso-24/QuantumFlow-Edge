"""
Modelo de la red hídrica urbana como grafo dirigido.

Cada arista es un tramo de tubería con una válvula controlable.
La decisión binaria x_e ∈ {0,1} indica si la válvula está abierta.
"""
from dataclasses import dataclass, field
import random


@dataclass
class Pipe:
    """Tramo de tubería con válvula controlable."""
    id: int
    source: int
    target: int
    capacity: float          # L/s máximos
    base_leak: float         # tasa de fuga nominal (fracción del flujo)
    anomaly_leak: float = 0.0  # fuga extra reportada por el nodo Edge

    @property
    def leak_rate(self) -> float:
        return self.base_leak + self.anomaly_leak


@dataclass
class WaterNetwork:
    """Red de distribución: nodos (cruces/colonias) y tuberías (aristas)."""
    num_nodes: int
    pipes: list[Pipe] = field(default_factory=list)
    demand: dict[int, float] = field(default_factory=dict)   # L/s por nodo
    sources: set[int] = field(default_factory=set)           # plantas/pozos
    positions: dict[int, tuple[float, float]] = field(default_factory=dict)

    def incoming(self, node: int) -> list[Pipe]:
        return [p for p in self.pipes if p.target == node]

    def report_anomaly(self, pipe_id: int, severity: float) -> None:
        """Un nodo Edge reportó fuga: severity ∈ [0,1] escala la fuga extra."""
        self.pipes[pipe_id].anomaly_leak = 0.45 * severity

    def clear_anomalies(self) -> None:
        for p in self.pipes:
            p.anomaly_leak = 0.0

    @classmethod
    def puebla_demo(cls, num_nodes: int = 16, seed: int = 42) -> "WaterNetwork":
        """
        Red sintética inspirada en la zona metropolitana de Puebla:
        2 fuentes (planta potabilizadora + pozos) y malla redundante,
        para que SIEMPRE existan rutas alternativas que el QUBO pueda elegir.
        """
        rng = random.Random(seed)
        net = cls(num_nodes=num_nodes)
        net.sources = {0, 1}

        cols = 4
        for i in range(num_nodes):
            net.positions[i] = (i % cols + rng.uniform(-0.2, 0.2),
                                i // cols + rng.uniform(-0.2, 0.2))
            if i not in net.sources:
                net.demand[i] = rng.uniform(8.0, 30.0)

        pid = 0
        for i in range(num_nodes):
            for j in range(i + 1, num_nodes):
                xi, yi = net.positions[i]
                xj, yj = net.positions[j]
                if (xi - xj) ** 2 + (yi - yj) ** 2 <= 2.2:  # solo vecinos cercanos
                    net.pipes.append(Pipe(
                        id=pid, source=i, target=j,
                        capacity=rng.uniform(40, 90),
                        base_leak=rng.uniform(0.01, 0.05),
                    ))
                    pid += 1
        return net

    def to_dict(self) -> dict:
        """Serialización para el frontend (mapa SVG)."""
        return {
            "nodes": [
                {
                    "id": i,
                    "x": self.positions[i][0],
                    "y": self.positions[i][1],
                    "demand": self.demand.get(i, 0.0),
                    "is_source": i in self.sources,
                }
                for i in range(self.num_nodes)
            ],
            "pipes": [
                {
                    "id": p.id, "source": p.source, "target": p.target,
                    "capacity": p.capacity, "leak_rate": round(p.leak_rate, 4),
                    "has_anomaly": p.anomaly_leak > 0,
                }
                for p in self.pipes
            ],
        }
