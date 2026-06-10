/** Inicio — explica el producto a CUALQUIER persona en 60 segundos. */
import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function HomeScreen({ goLive }: { goLive: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>RED DE AGUA POTABLE DE PUEBLA</Text>
        <Text style={styles.heroTitle}>
          De cada 10 litros que produce Puebla,{"\n"}
          <Text style={{ color: colors.red }}>4 nunca llegan a una llave.</Text>
        </Text>
        <Text style={styles.heroSub}>
          QuantumFlow Edge encuentra las fugas en segundos y reorganiza la red de
          la ciudad automáticamente — sin dejar a ninguna colonia sin agua.
        </Text>
        <Pressable style={styles.cta} onPress={goLive}>
          <Text style={styles.ctaText}>Ver la red en vivo →</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Stat n="3,718" unit="litros/seg" d="produce hoy la red de Puebla" tag="real" />
        <Stat n="41%" unit="se pierde" d="en fugas y tomas no registradas" tag="real" />
        <Stat n="203" unit="pozos" d="de un acuífero que declina 3.8% al año" tag="real" />
        <Stat n="135 de 963" unit="colonias" d="tienen agua las 24 horas" tag="real" />
      </View>
      <Text style={styles.sourceNote}>
        Cifras públicas de Agua de Puebla, SOAPAP y CONAGUA — ver pestaña “Datos”.
      </Text>

      <Text style={styles.sectionTitle}>¿Qué hace este sistema?</Text>
      <View style={styles.cards}>
        <Card emoji="🛰️" title="1 · Detecta en la tubería">
          Sensores de bajo costo (menos de $200 MXN cada uno) viven dentro de la red y
          aprenden cómo se comporta su tubería. Cuando algo cambia — una fuga, una toma
          ilegal — lo saben en menos de un segundo, sin internet y sin nube.
        </Card>
        <Card emoji="⚛️" title="2 · Decide con computación cuántica">
          ¿Qué válvulas cerrar para aislar la fuga sin quitarle el agua a nadie?
          Con 31 válvulas hay más de 2 mil millones de combinaciones. Un optimizador
          cuántico (QUBO) encuentra la mejor en menos de un segundo.
        </Card>
        <Card emoji="💧" title="3 · El agua deja de perderse">
          La red se reconfigura, la fuga queda contenida y el panel muestra cuánta
          agua se recuperó: en litros por segundo, en pipas y en hogares equivalentes.
          Todo queda en una bitácora auditable.
        </Card>
      </View>

      <View style={styles.impactBox}>
        <Text style={styles.impactTitle}>El impacto si se despliega en toda la red</Text>
        <Text style={styles.impactText}>
          Reducir las fugas físicas de 21% a 14% recuperaría{" "}
          <Text style={{ color: colors.green, fontWeight: "800" }}>≈ 22,500 m³ cada día</Text>
          {" "}— el agua de ~170,000 personas — sin perforar un solo pozo nuevo.
        </Text>
        <Text style={styles.impactNote}>Proyección propia sobre cifras oficiales (metodología en “Datos”).</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ n, unit, d, tag }: { n: string; unit: string; d: string; tag: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statD}>{d}</Text>
    </View>
  );
}

function Card({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, maxWidth: 980, width: "100%", alignSelf: "center" },
  hero: { paddingVertical: 28 },
  heroKicker: { color: colors.cyan, fontSize: 12, letterSpacing: 3, marginBottom: 12 },
  heroTitle: { color: colors.text, fontSize: 34, fontWeight: "800", lineHeight: 42 },
  heroSub: { color: colors.textDim, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 640 },
  cta: {
    backgroundColor: colors.cyan, borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 22, alignSelf: "flex-start", marginTop: 20,
  },
  ctaText: { color: "#04141C", fontWeight: "800", fontSize: 15 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  stat: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 14, padding: 16, flexGrow: 1, flexBasis: 180,
  },
  statN: { color: colors.gold, fontSize: 26, fontWeight: "800" },
  statUnit: { color: colors.textDim, fontSize: 13, marginBottom: 6 },
  statD: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  sourceNote: { color: colors.textFaint, fontSize: 11, marginTop: 8 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 34, marginBottom: 14 },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 14, padding: 18, flexGrow: 1, flexBasis: 260, maxWidth: 420,
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardBody: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  impactBox: {
    backgroundColor: "#0B2418", borderColor: "#1E4D36", borderWidth: 1,
    borderRadius: 14, padding: 20, marginTop: 30, marginBottom: 40,
  },
  impactTitle: { color: colors.green, fontSize: 14, fontWeight: "800", marginBottom: 8 },
  impactText: { color: colors.textDim, fontSize: 15, lineHeight: 23 },
  impactNote: { color: colors.textFaint, fontSize: 11, marginTop: 8 },
});
