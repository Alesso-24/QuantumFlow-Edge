/** Cómo funciona — la tecnología explicada sin tecnicismos, paso a paso. */
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

export default function HowItWorksScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Cómo funciona</Text>
      <Text style={styles.intro}>
        Tres capas que se hablan en tiempo real. Cada una resuelve la parte del
        problema que las otras no pueden.
      </Text>

      <Step n="1" emoji="🛰️" title="El sensor que aprende su tubería"
        tech="Edge AI · C++ · ESP32">
        Cada sensor mide el flujo de agua de SU tramo cada segundo y construye una
        “memoria estadística” de lo normal: cuánto fluye de madrugada, en la mañana,
        en domingo. Cuando el flujo se sale de lo aprendido (una fuga lo dispara hacia
        arriba), el sensor lo nota al instante.{"\n\n"}
        La clave: la decisión ocurre EN el sensor, no en un servidor. Por eso funciona
        aunque se caiga el internet, gasta casi nada de batería y de datos, y escala a
        miles de puntos sin saturar nada. El 99.9% del tiempo, silencio = todo bien.
      </Step>

      <Step n="2" emoji="⚛️" title="La decisión cuántica"
        tech="Optimización QUBO · 31 qubits · Simulated Annealing / QAOA">
        Detectar la fuga es la mitad del problema. La otra mitad: ¿qué hacer con la
        red AHORA? Cerrar la tubería rota desvía el agua por otras rutas… que tienen
        sus propios límites y sus propias fugas. Con 31 válvulas hay 2³¹ — más de
        2 mil millones — de combinaciones posibles.{"\n\n"}
        Ese tipo de problema (combinatorio, explosivo) es donde brillan las
        computadoras cuánticas. Lo formulamos como QUBO: cada válvula es un qubit que
        puede estar abierto o cerrado, y “la mejor jugada” es la configuración de
        mínima energía. El solver la encuentra en menos de un segundo, con una regla
        inquebrantable: <Text style={styles.bold}>ninguna colonia se queda sin agua</Text> —
        eso no es una promesa, es una restricción matemática del modelo, verificada
        automáticamente en cada cambio del código.{"\n\n"}
        Hoy corre en un simulador cuántico (Qiskit) y en un annealer clásico para
        respuesta garantizada. La MISMA matemática se ejecuta en una computadora
        cuántica real (IBM, D-Wave) sin cambiar una línea: cuando la red crezca a
        miles de válvulas, el hardware cuántico ya tendrá sentido económico.
      </Step>

      <Step n="3" emoji="📱" title="El centro de control en cualquier pantalla"
        tech="React Native + Expo · iOS / Android / Web / Escritorio">
        El operador de campo en su teléfono, el supervisor en su tablet y el centro de
        control en el videowall ven exactamente la misma red al mismo tiempo, porque es
        exactamente la misma aplicación. El mapa usa la cartografía real de Puebla;
        cada optimización muestra cuánta agua se recuperó y todo queda en una bitácora
        que se puede auditar después: qué se detectó, qué decidió el optimizador, cuándo
        se reparó.
      </Step>

      <View style={styles.flowBox}>
        <Text style={styles.flowTitle}>Un evento de fuga, en ~2 segundos</Text>
        <Text style={styles.flowLine}>💥 Se rompe una tubería en La Paz</Text>
        <Text style={styles.flowArrow}>↓ menos de 1 segundo</Text>
        <Text style={styles.flowLine}>🛰️ El sensor local detecta el cambio y avisa (un solo mensaje)</Text>
        <Text style={styles.flowArrow}>↓ ~100 milisegundos</Text>
        <Text style={styles.flowLine}>⚛️ El core cuántico evalúa 2³¹ configuraciones de válvulas</Text>
        <Text style={styles.flowArrow}>↓ ~850 milisegundos</Text>
        <Text style={styles.flowLine}>✅ Plan óptimo: fuga aislada, 16 zonas con agua, evento en bitácora</Text>
        <Text style={styles.flowArrow}>↓ instantáneo</Text>
        <Text style={styles.flowLine}>📱 Todas las pantallas muestran la red reconfigurada y el ahorro</Text>
      </View>

      <Text style={styles.faqTitle}>Preguntas directas</Text>
      <Faq q="¿Esto ya está instalado en Puebla?">
        No. El software está terminado y opera sobre un “gemelo digital” de la red real
        (sectores, fuentes y cifras reales; telemetría simulada). El firmware del sensor
        ya existe; desplegarlo requiere convenio con el organismo operador. La pestaña
        “Datos” detalla qué es real y qué es simulado.
      </Faq>
      <Faq q="¿De verdad se necesita una computadora cuántica?">
        Para 31 válvulas, no — y lo decimos abiertamente. Para las >10,000 válvulas de
        una red metropolitana completa, los métodos exactos dejan de alcanzar y la
        formulación QUBO que ya usamos es la puerta de entrada nativa al hardware
        cuántico. Construimos la arquitectura correcta desde el día uno.
      </Faq>
      <Faq q="¿Qué pasa si el sensor se equivoca?">
        Una falsa alarma cuesta una reoptimización de un segundo (y queda registrada),
        no una excavación. El umbral estadístico (z-score 3.5 con 30 muestras de
        calentamiento) mantiene las falsas alarmas debajo del 0.05%.
      </Faq>
    </ScrollView>
  );
}

function Step({ n, emoji, title, tech, children }: {
  n: string; emoji: string; title: string; tech: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepN}>{n}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>{emoji} {title}</Text>
          <Text style={styles.stepTech}>{tech}</Text>
        </View>
      </View>
      <Text style={styles.stepBody}>{children}</Text>
    </View>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <View style={styles.faq}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 22, maxWidth: 860, width: "100%", alignSelf: "center", paddingBottom: 56 },
  title: { color: colors.text, fontSize: 26, fontFamily: fonts.display, marginTop: 18, lineHeight: 36 },
  intro: { color: colors.textDim, fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 24, fontFamily: fonts.body },
  step: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 22, marginBottom: 14,
  },
  stepHeader: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 12 },
  stepN: {
    color: colors.gold, fontSize: 18, fontFamily: fonts.mono, borderColor: colors.border,
    borderWidth: 1, borderRadius: 4, width: 42, height: 42, textAlign: "center",
    lineHeight: 40,
  },
  stepTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.bodyBold },
  stepTech: { color: colors.violet, fontSize: 11, marginTop: 4, fontFamily: fonts.monoRegular, letterSpacing: 0.5 },
  stepBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22, fontFamily: fonts.body },
  bold: { color: colors.textDim, fontFamily: fonts.bodyBold },
  flowBox: {
    backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1,
    borderLeftWidth: 3, borderLeftColor: colors.agua,
    borderRadius: 6, padding: 22, marginVertical: 18,
  },
  flowTitle: { color: colors.agua, fontSize: 13, fontFamily: fonts.monoRegular, letterSpacing: 2, marginBottom: 16 },
  flowLine: { color: colors.textDim, fontSize: 14, lineHeight: 21, fontFamily: fonts.body },
  flowArrow: { color: colors.textFaint, fontSize: 12, marginVertical: 5, marginLeft: 10, fontFamily: fonts.monoRegular },
  faqTitle: { color: colors.text, fontSize: 20, fontFamily: fonts.display, marginTop: 24, marginBottom: 14, lineHeight: 28 },
  faq: { marginBottom: 18 },
  faqQ: { color: colors.text, fontSize: 15, fontFamily: fonts.bodyBold, marginBottom: 6 },
  faqA: { color: colors.textMuted, fontSize: 14, lineHeight: 21, fontFamily: fonts.body },
});
