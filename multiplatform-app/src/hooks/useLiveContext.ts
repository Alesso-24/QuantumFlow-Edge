/**
 * Contexto hídrico EN VIVO para Puebla — datos 100% reales vía Open-Meteo
 * (API pública, sin llave). La lluvia y la temperatura modulan la demanda
 * de agua y el riesgo de falsos positivos en los sensores.
 */
import { useEffect, useState } from "react";

const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=19.04&longitude=-98.20" +
  "&current=temperature_2m,precipitation,relative_humidity_2m,rain" +
  "&daily=precipitation_sum,precipitation_probability_max" +
  "&timezone=America%2FMexico_City&forecast_days=1";

export interface LiveContext {
  temperatureC: number;
  humidityPct: number;
  rainNowMm: number;
  rainTodayMm: number;
  rainProbPct: number;
  fetchedAt: string;
}

export function useLiveContext(): { live: LiveContext | null; error: boolean } {
  const [live, setLive] = useState<LiveContext | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(URL);
        const d = await r.json();
        if (!alive) return;
        setLive({
          temperatureC: d.current.temperature_2m,
          humidityPct: d.current.relative_humidity_2m,
          rainNowMm: d.current.rain,
          rainTodayMm: d.daily.precipitation_sum[0],
          rainProbPct: d.daily.precipitation_probability_max[0],
          fetchedAt: new Date().toLocaleTimeString(),
        });
        setError(false);
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    const t = setInterval(load, 10 * 60 * 1000);  // refresco cada 10 min
    return () => { alive = false; clearInterval(t); };
  }, []);

  return { live, error };
}
