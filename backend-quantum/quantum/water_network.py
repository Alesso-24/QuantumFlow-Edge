"""
Modelo de la red hídrica urbana como grafo dirigido.

Cada arista es un tramo de tubería troncal con válvula controlable.
La decisión binaria x_e ∈ {0,1} indica si la válvula está abierta.

La red de producción se carga de data/puebla_network.json: zonas reales
de la ciudad de Puebla con demandas estimadas a partir de datos públicos
de Agua de Puebla / SOAPAP / CONAGUA (ver docs/DATA.md).
"""
import json
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path


def _data_dir() -> Path:
    """Carpeta data/ tanto en desarrollo como dentro del .exe (PyInstaller)."""
    if getattr(sys, "_MEIPASS", None):
        return Path(sys._MEIPASS) / "data"
    return Path(__file__).resolve().parent.parent / "data"


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
    """Red de distribución: nodos (sectores/baterías de pozos) y tuberías."""
    num_nodes: int
    pipes: list[Pipe] = field(default_factory=list)
    demand: dict[int, float] = field(default_factory=dict)   # L/s por nodo
    sources: set[int] = field(default_factory=set)           # baterías de pozos
    positions: dict[int, tuple[float, float]] = field(default_factory=dict)
    names: dict[int, str] = field(default_factory=dict)
    metadata: dict = field(default_factory=dict)

    def incoming(self, node: int) -> list[Pipe]:
        return [p for p in self.pipes if p.target == node]

    def report_anomaly(self, pipe_id: int, severity: float) -> None:
        """Un nodo Edge reportó fuga: severity ∈ [0,1] escala la fuga extra."""
        self.pipes[pipe_id].anomaly_leak = 0.45 * severity

    def clear_anomaly(self, pipe_id: int) -> None:
        self.pipes[pipe_id].anomaly_leak = 0.0

    @classmethod
    def from_json(cls, path: Path | None = None) -> "WaterNetwork":
        """Carga la red real de Puebla desde data/puebla_network.json."""
        path = path or _data_dir() / "puebla_network.json"
        raw = json.loads(path.read_text(encoding="utf-8"))

        net = cls(num_nodes=len(raw["nodes"]), metadata=raw.get("metadata", {}))
        for n in raw["nodes"]:
            i = n["id"]
            # x = longitud, y = latitud; el frontend proyecta y escala
            net.positions[i] = (n["lon"], n["lat"])
            net.names[i] = n["name"]
            if n.get("is_source"):
                net.sources.add(i)
            else:
                net.demand[i] = float(n["demand_lps"])

        for pid, p in enumerate(raw["pipes"]):
            net.pipes.append(Pipe(
                id=pid, source=p["source"], target=p["target"],
                capacity=float(p["capacity_lps"]),
                base_leak=float(p["base_leak"]),
            ))
        return net

    @classmethod
    def puebla_demo(cls, num_nodes: int = 16, seed: int = 42) -> "WaterNetwork":
        """Red sintética pequeña — SOLO para tests unitarios y benchmarks."""
        rng = random.Random(seed)
        net = cls(num_nodes=num_nodes)
        net.sources = {0, 1}
        cols = 4
        for i in range(num_nodes):
            net.positions[i] = (i % cols + rng.uniform(-0.2, 0.2),
                                i // cols + rng.uniform(-0.2, 0.2))
            net.names[i] = f"Nodo {i}"
            if i not in net.sources:
                net.demand[i] = rng.uniform(8.0, 30.0)
        pid = 0
        for i in range(num_nodes):
            for j in range(i + 1, num_nodes):
                xi, yi = net.positions[i]
                xj, yj = net.positions[j]
                if (xi - xj) ** 2 + (yi - yj) ** 2 <= 2.2:
                    net.pipes.append(Pipe(
                        id=pid, source=i, target=j,
                        capacity=rng.uniform(40, 90),
                        base_leak=rng.uniform(0.01, 0.05),
                    ))
                    pid += 1
        return net

    def to_dict(self) -> dict:
        """Serialización para el frontend (mapa geográfico)."""
        return {
            "nodes": [
                {
                    "id": i,
                    "name": self.names.get(i, f"Nodo {i}"),
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
