/** Inicio — la tesis del producto, entendible por cualquier persona en 60 s. */
import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

export default function HomeScreen({ goLive }: { goLive: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* HERO — la tesis */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>EXPEDIENTE QF-PUE-2026 · ZONA DE COBERTURA SOAPAP</Text>
        <Text style={styles.heroTitle}>
          De cada 10 litros{"\n"}que produce Puebla,{"\n"}
          <Text style={{ color: colors.alarm }}>4 nunca llegan{"\n"}a una llave.</Text>
        </Text>
        <Text style={styles.heroSub}>
          QuantumFlow Edge encuentra las fugas en segundos y reorganiza la red
          de la ciudad automáticamente — sin dejar a ninguna colonia sin agua.
        </Text>
        <Pressable style={styles.cta} onPress={goLive}>
          <Text style={styles.ctaText}>VER LA RED EN VIVO</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>
      </View>

      {/* CIFRAS — lectura de expediente técnico */}
      <View style={styles.ledger}>
        <LedgerRow n="3,718" u="L/s" d="caudal que entrega hoy la red" />
        <LedgerRow n="41" u="%" d="se pierde en fugas y tomas no registradas" alarm />
        <LedgerRow n="203" u="pozos" d="de un acuífero que declina 3.8% anual" />
        <LedgerRow n="135/963" u="colonias" d="tienen servicio las 24 horas" />
      </View>
      <Text style={styles.sourceNote}>
        Cifras públicas de Agua de Puebla, SOAPAP y CONAGUA — trazabilidad completa en la sección Datos.
      </Text>

      {/* LAS 3 CAPAS */}
      <Text style={styles.sectionTitle}>Tres capas, una decisión en 2 segundos</Text>
      <View style={styles.cards}>
        <Card tag="DETECTA" tagColor={colors.agua} title="Sensores que piensan en la tubería">
          Nodos de menos de $200 MXN aprenden el pulso normal de su tramo. Una fuga
          lo altera y la detectan en menos de un segundo — sin internet, sin nube.
        </Card>
        <Card tag="DECIDE" tagColor={colors.violet} title="Optimización cuántica de la red">
          Con 31 válvulas hay 2³¹ jugadas posibles. Un optimizador QUBO encuentra la
          mejor en menos de un segundo, con una regla matemática inquebrantable:
          ninguna colonia se queda sin agua.
        </Card>
        <Card tag="RECUPERA" tagColor={colors.gold} title="El agua deja de perderse">
          La red se reconfigura sola, la fuga queda contenida y cada litro recuperado
          se contabiliza en una bitácora auditable: litros, pipas y hogares equivalentes.
        </Card>
      </View>

      {/* IMPACTO */}
      <View style={styles.impactBox}>
        <Text style={styles.impactEyebrow}>PROYECCIÓN SOBRE CIFRAS OFICIALES</Text>
        <Text style={styles.impactNumber}>22,500 m³/día</Text>
        <Text style={styles.impactText}>
          recuperables al bajar las fugas físicas de 21% a 14% — el agua de
          ~170,000 personas, sin perforar un solo pozo nuevo.
        </Text>
      </View>
    </ScrollView>
  );
}

function LedgerRow({ n, u, d, alarm }: { n: string; u: string; d: string; alarm?: boolean }) {
  return (
    <View style={styles.ledgerRow}>
      <Text style={[styles.ledgerN, alarm && { color: colors.alarm }]}>{n}</Text>
      <Text style={styles.ledgerU}>{u}</Text>
      <Text style={styles.ledgerD}>{d}</Text>
    </View>
  );
}

function Card({ tag, tagColor, title, children }: {
  tag: string; tagColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, { borderTopColor: tagColor }]}>
      <Text style={[styles.cardTag, { color: tagColor }]}>{tag}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 22, maxWidth: 980, width: "100%", alignSelf: "center", paddingBottom: 56 },
  hero: { paddingVertical: 30 },
  heroEyebrow: {
    color: colors.gold, fontSize: 10, fontFamily: fonts.monoRegular,
    letterSpacing: 2, marginBottom: 18,
  },
  heroTitle: {
    color: colors.text, fontSize: 38, lineHeight: 50, fontFamily: fonts.display,
  },
  heroSub: {
    color: colors.textDim, fontSize: 16, lineHeight: 25, marginTop: 18,
    maxWidth: 600, fontFamily: fonts.body,
  },
  cta: {
    backgroundColor: colors.agua, borderRadius: 4, paddingVertical: 14,
    paddingHorizontal: 24, alignSelf: "flex-start", marginTop: 24,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  ctaText: { color: colors.bg, fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 2 },
  ctaArrow: { color: colors.bg, fontSize: 16, fontFamily: fonts.bodyBold },
  ledger: {
    borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10,
  },
  ledgerRow: {
    flexDirection: "row", alignItems: "baseline", gap: 12,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  ledgerN: {
    color: colors.agua, fontSize: 24, fontFamily: fonts.mono, minWidth: 122,
    textAlign: "right",
  },
  ledgerU: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.monoRegular, minWidth: 58 },
  ledgerD: { color: colors.textDim, fontSize: 14, fontFamily: fonts.body, flex: 1 },
  sourceNote: { color: colors.textFaint, fontSize: 11, marginTop: 10, fontFamily: fonts.body },
  sectionTitle: {
    color: colors.text, fontSize: 20, fontFamily: fonts.display,
    marginTop: 42, marginBottom: 18, lineHeight: 28,
  },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderTopWidth: 3, borderRadius: 6, padding: 20, flexGrow: 1,
    flexBasis: 260, maxWidth: 430,
  },
  cardTag: { fontSize: 10, fontFamily: fonts.monoRegular, letterSpacing: 3, marginBottom: 10 },
  cardTitle: {
    color: colors.text, fontSize: 16, fontFamily: fonts.bodyBold,
    marginBottom: 10, lineHeight: 22,
  },
  cardBody: { color: colors.textMuted, fontSize: 13.5, lineHeight: 21, fontFamily: fonts.body },
  impactBox: {
    borderLeftWidth: 3, borderLeftColor: colors.agua, backgroundColor: colors.surface,
    borderRadius: 6, padding: 24, marginTop: 34,
  },
  impactEyebrow: {
    color: colors.textMuted, fontSize: 10, fontFamily: fonts.monoRegular,
    letterSpacing: 2, marginBottom: 10,
  },
  impactNumber: { color: colors.agua, fontSize: 34, fontFamily: fonts.display },
  impactText: {
    color: colors.textDim, fontSize: 15, lineHeight: 23, marginTop: 10,
    fontFamily: fonts.body, maxWidth: 560,
  },
});
