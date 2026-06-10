/** Datos — transparencia total: qué es real (y en vivo), qué es estimado,
 *  qué es simulado. Además: conexión al servidor configurable. */
import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, Platform, StyleSheet } from "react-native";
import { colors, fonts, badge } from "../theme";
import { useLiveContext } from "../hooks/useLiveContext";

export default function DataScreen({ server, twinMode }: { server: string; twinMode: boolean }) {
  const { live, error } = useLiveContext();
  const [serverInput, setServerInput] = useState(server);

  const applyServer = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage?.setItem("qfe_server", serverInput.trim());
      window.location.search = `?server=${encodeURIComponent(serverInput.trim())}`;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Datos y transparencia</Text>
      <Text style={styles.intro}>
        Regla del producto: <Text style={{ color: colors.text, fontWeight: "700" }}>
        cada número lleva etiqueta</Text>. Nada simulado se presenta como real.
      </Text>

      {/* ---- EN VIVO ---- */}
      <Section tag={badge.liveReal} title="Contexto hídrico de Puebla ahora mismo">
        {live ? (
          <View style={styles.liveRow}>
            <LiveStat v={`${live.temperatureC}°C`} l="temperatura" />
            <LiveStat v={`${live.humidityPct}%`} l="humedad" />
            <LiveStat v={`${live.rainTodayMm} mm`} l="lluvia hoy" />
            <LiveStat v={`${live.rainProbPct}%`} l="prob. de lluvia" />
          </View>
        ) : (
          <Text style={styles.body}>{error ? "Sin conexión a la API meteorológica." : "Consultando…"}</Text>
        )}
        <Text style={styles.note}>
          Fuente: Open-Meteo (API pública, medición/modelo meteorológico real,
          actualizado cada 10 min{live ? `, consultado ${live.fetchedAt}` : ""}).
          La lluvia modula la demanda de agua y el riesgo de falsos positivos de los sensores.
        </Text>
      </Section>

      {/* ---- REAL PUBLICADO ---- */}
      <Section tag={badge.real} title="Cifras oficiales de la red (fuentes públicas)">
        <Row k="Caudal entregado" v="3,718 L/s (abr 2026)" s="Agua de Puebla" />
        <Row k="Población servida" v="1,812,000 hab · 963 colonias" s="Agua de Puebla" />
        <Row k="Pérdidas totales" v="40–41% del agua extraída" s="SOAPAP / Telediario" />
        <Row k="Desglose de pérdidas" v="21% fugas físicas + 20% tomas no registradas" s="Periódico Central" />
        <Row k="Fuentes de abastecimiento" v="203 pozos profundos (Acuífero Valle de Puebla)" s="CONAGUA DR-2104" />
        <Row k="Declive del acuífero" v="−3.8% anual (~150 L/s)" s="Agua de Puebla" />
        <Row k="Servicio continuo 24 h" v="solo 135 de 963 colonias" s="SOAPAP" />
        <Row k="Geografía de los 16 sectores" v="nombres y coordenadas reales de la ciudad" s="cartografía pública" />
        <Text style={styles.note}>Enlaces completos: docs/DATA.md en el repositorio.</Text>
      </Section>

      {/* ---- ESTIMADO ---- */}
      <Section tag={badge.estimated} title="Estimaciones propias (metodología abierta)">
        <Row k="Población por sector" v="reparto del 1.81M oficial entre 16 agrupaciones de colonias" />
        <Row k="Demanda por nodo" v="población × 130 L/hab/día ÷ 86,400 s → total 2,430 L/s (~65% del caudal, consistente con las pérdidas)" />
        <Row k="Capacidad de troncales" v="200–700 L/s por jerarquía típica (SOAPAP no publica su catastro)" />
        <Row k="Fuga base por tramo" v="6–13%, calibrada para reproducir el 21% de pérdida física oficial" />
      </Section>

      {/* ---- SIMULADO ---- */}
      <Section tag={badge.simulated} title="Simulado (y por qué)">
        <Row k="Telemetría de sensores" v="gemelo digital — no hay hardware desplegado; el firmware C++ ya existe en el repositorio" />
        <Row k="Eventos de fuga" v="generados en modo prueba; las fugas reales de Puebla existen (21%) pero no están georreferenciadas públicamente" />
        <Row k="Actuación de válvulas" v="el plan del optimizador es real; moverlas requiere válvulas motorizadas (fase de despliegue)" />
      </Section>

      {/* ---- CONEXIÓN ---- */}
      <Section tag={{ label: twinMode ? "🛰️ GEMELO DIGITAL" : "🔌 CONECTADO", color: twinMode ? colors.violet : colors.green }}
               title="Conexión al core cuántico">
        <Text style={styles.body}>
          {twinMode
            ? "Sin backend alcanzable: la app está operando como gemelo digital local de la red real (todo lo que ves se calcula en este dispositivo)."
            : `Conectado al servidor ${server}.`}
        </Text>
        {Platform.OS === "web" && (
          <View style={styles.serverRow}>
            <TextInput
              style={styles.serverInput}
              value={serverInput}
              onChangeText={setServerInput}
              placeholder="IP:puerto del core (ej. 192.168.1.50:8000)"
              placeholderTextColor={colors.textFaint}
            />
            <Pressable style={styles.serverBtn} onPress={applyServer}>
              <Text style={styles.serverBtnText}>Conectar</Text>
            </Pressable>
          </View>
        )}
      </Section>
    </ScrollView>
  );
}

function Section({ tag, title, children }: {
  tag: { label: string; color: string }; title: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.tag, { color: tag.color, borderColor: tag.color }]}>{tag.label}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ k, v, s }: { k: string; v: string; s?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowK}>{k}</Text>
      <Text style={styles.rowV}>{v}{s ? <Text style={styles.rowS}>  · {s}</Text> : null}</Text>
    </View>
  );
}

function LiveStat({ v, l }: { v: string; l: string }) {
  return (
    <View style={styles.liveStat}>
      <Text style={styles.liveV}>{v}</Text>
      <Text style={styles.liveL}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 22, maxWidth: 860, width: "100%", alignSelf: "center", paddingBottom: 56 },
  title: { color: colors.text, fontSize: 26, fontFamily: fonts.display, marginTop: 18, lineHeight: 36 },
  intro: { color: colors.textDim, fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 22, fontFamily: fonts.body },
  section: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 20, marginBottom: 14,
  },
  tag: {
    alignSelf: "flex-start", fontSize: 10, fontFamily: fonts.monoRegular, letterSpacing: 1.5,
    borderWidth: 1, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bodyBold, marginBottom: 12 },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 21, fontFamily: fonts.body },
  note: { color: colors.textFaint, fontSize: 11, lineHeight: 16, marginTop: 12, fontFamily: fonts.body },
  row: { marginBottom: 10 },
  rowK: { color: colors.textDim, fontSize: 13, fontFamily: fonts.bodyBold },
  rowV: { color: colors.textMuted, fontSize: 13, lineHeight: 19, fontFamily: fonts.body },
  rowS: { color: colors.textFaint, fontSize: 12, fontFamily: fonts.body },
  liveRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  liveStat: {
    backgroundColor: colors.surfaceAlt, borderRadius: 4, padding: 14,
    minWidth: 112, alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  liveV: { color: colors.agua, fontSize: 19, fontFamily: fonts.mono },
  liveL: { color: colors.textMuted, fontSize: 11, marginTop: 4, fontFamily: fonts.body },
  serverRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  serverInput: {
    flex: 1, backgroundColor: colors.surfaceAlt, borderColor: colors.border,
    borderWidth: 1, borderRadius: 10, color: colors.text, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 13,
  },
  serverBtn: {
    backgroundColor: colors.cyan, borderRadius: 10, paddingHorizontal: 16,
    justifyContent: "center",
  },
  serverBtnText: { color: "#04141C", fontWeight: "800", fontSize: 13 },
});
