/** Cómo funciona — la tecnología explicada sin tecnicismos, paso a paso. */
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

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
  scroll: { padding: 20, maxWidth: 860, width: "100%", alignSelf: "center", paddingBottom: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 16 },
  intro: { color: colors.textDim, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 22 },
  step: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 14, padding: 20, marginBottom: 14,
  },
  stepHeader: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 12 },
  stepN: {
    color: colors.cyan, fontSize: 24, fontWeight: "800", borderColor: colors.cyan,
    borderWidth: 2, borderRadius: 24, width: 44, height: 44, textAlign: "center",
    lineHeight: 40,
  },
  stepTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  stepTech: { color: colors.violet, fontSize: 12, marginTop: 3 },
  stepBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  bold: { color: colors.textDim, fontWeight: "800" },
  flowBox: {
    backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1,
    borderRadius: 14, padding: 20, marginVertical: 18,
  },
  flowTitle: { color: colors.gold, fontSize: 15, fontWeight: "800", marginBottom: 14 },
  flowLine: { color: colors.textDim, fontSize: 14, lineHeight: 21 },
  flowArrow: { color: colors.textFaint, fontSize: 12, marginVertical: 4, marginLeft: 10 },
  faqTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 22, marginBottom: 12 },
  faq: { marginBottom: 16 },
  faqQ: { color: colors.cyan, fontSize: 15, fontWeight: "700", marginBottom: 6 },
  faqA: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
});
