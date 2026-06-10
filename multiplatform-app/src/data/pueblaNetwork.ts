/**
 * Red de agua potable de Puebla — espejo de backend-quantum/data/puebla_network.json.
 *
 * Usada por el MODO GEMELO DIGITAL cuando no hay backend alcanzable
 * (p. ej. la versión web pública). Zonas y coordenadas: reales.
 * Demandas: estimadas de datos públicos — ver docs/DATA.md del repo.
 */
import { NetNode, NetPipe } from "../hooks/useQuantumFeed";

// x = longitud, y = latitud (el mapa proyecta y escala)
export const PUEBLA_NODES: NetNode[] = [
  { id: 0, name: "Batería de pozos Norte (San Jerónimo–San Aparicio)", x: -98.205, y: 19.095, demand: 0, is_source: true },
  { id: 1, name: "Batería de pozos Oriente (Amalucan–La Calera)", x: -98.130, y: 19.052, demand: 0, is_source: true },
  { id: 2, name: "Batería de pozos Sur-Poniente (Atlixcáyotl)", x: -98.247, y: 18.993, demand: 0, is_source: true },
  { id: 3, name: "Centro Histórico", x: -98.198, y: 19.044, demand: 180, is_source: false },
  { id: 4, name: "Xonaca–El Alto", x: -98.183, y: 19.050, demand: 120, is_source: false },
  { id: 5, name: "La Paz", x: -98.223, y: 19.056, demand: 135, is_source: false },
  { id: 6, name: "San Felipe Hueyotlipan", x: -98.212, y: 19.083, demand: 195, is_source: false },
  { id: 7, name: "San Jerónimo Caleras", x: -98.224, y: 19.093, demand: 150, is_source: false },
  { id: 8, name: "La Margarita", x: -98.170, y: 19.015, demand: 210, is_source: false },
  { id: 9, name: "San Manuel", x: -98.178, y: 19.023, demand: 195, is_source: false },
  { id: 10, name: "Bosques de San Sebastián", x: -98.137, y: 19.064, demand: 180, is_source: false },
  { id: 11, name: "Amalucan", x: -98.153, y: 19.057, demand: 135, is_source: false },
  { id: 12, name: "Agua Santa", x: -98.208, y: 18.993, demand: 120, is_source: false },
  { id: 13, name: "Castillotla–Valle del Paseo", x: -98.244, y: 18.987, demand: 165, is_source: false },
  { id: 14, name: "San Baltazar Campeche", x: -98.209, y: 19.019, demand: 150, is_source: false },
  { id: 15, name: "Las Ánimas", x: -98.236, y: 19.021, demand: 105, is_source: false },
  { id: 16, name: "Angelópolis–Atlixcáyotl", x: -98.262, y: 19.009, demand: 135, is_source: false },
  { id: 17, name: "La Libertad", x: -98.235, y: 19.056, demand: 165, is_source: false },
  { id: 18, name: "Mayorazgo", x: -98.221, y: 19.008, demand: 90, is_source: false },
];

const RAW_PIPES: Array<[number, number, number, number]> = [
  // [source, target, capacity L/s, base_leak]
  [0, 7, 700, 0.06], [0, 6, 700, 0.08], [0, 5, 500, 0.10], [7, 6, 400, 0.09],
  [6, 5, 350, 0.11], [5, 17, 300, 0.10], [5, 3, 400, 0.13], [17, 15, 300, 0.09],
  [3, 4, 300, 0.13], [4, 11, 300, 0.10], [1, 11, 600, 0.07], [1, 10, 600, 0.07],
  [11, 10, 300, 0.09], [10, 4, 250, 0.10], [1, 4, 400, 0.09], [3, 14, 350, 0.12],
  [14, 12, 300, 0.10], [2, 12, 500, 0.07], [2, 13, 600, 0.06], [13, 16, 300, 0.08],
  [2, 16, 500, 0.06], [16, 15, 250, 0.09], [15, 18, 250, 0.10], [18, 14, 250, 0.11],
  [18, 12, 200, 0.10], [9, 8, 300, 0.12], [3, 9, 350, 0.13], [1, 8, 500, 0.08],
  [8, 12, 250, 0.11], [9, 14, 250, 0.12], [11, 8, 250, 0.10],
];

export const PUEBLA_PIPES: NetPipe[] = RAW_PIPES.map(([source, target, capacity, leak], id) => ({
  id, source, target, capacity, leak_rate: leak, has_anomaly: false,
}));
