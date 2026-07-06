import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/GlobalStyles';

// Radar de metodología del coach (0-10) que devuelve analyze-session:
// control del marco, profundidad del dolor, aislamiento de objeción,
// desapego, micro-compromisos. Espejo del MethodScores.jsx web.

const LABELS = {
  frameControl: { es: 'Control del marco', en: 'Frame control' },
  painDepth: { es: 'Profundidad del dolor', en: 'Pain depth' },
  objectionIsolation: { es: 'Aislamiento de objeción', en: 'Objection isolation' },
  detachment: { es: 'Desapego', en: 'Detachment' },
  microCommitments: { es: 'Micro-compromisos', en: 'Micro-commitments' },
};
const ORDER = ['frameControl', 'painDepth', 'objectionIsolation', 'detachment', 'microCommitments'];

function barColor(v) {
  return v >= 8 ? colors.success : v >= 5 ? colors.accent : colors.danger;
}

export default function MethodScores({ scores }) {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  if (!scores || typeof scores !== 'object') return null;
  const entries = ORDER.filter(k => typeof scores[k] === 'number');
  if (!entries.length) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🩺 {isEn ? 'Methodology radar' : 'Radar de metodología'}</Text>
      {entries.map(k => {
        const v = Math.max(0, Math.min(10, scores[k]));
        const c = barColor(v);
        return (
          <View key={k} style={{ marginBottom: 8 }}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{isEn ? LABELS[k].en : LABELS[k].es}</Text>
              <Text style={[styles.value, { color: c }]}>{v}/10</Text>
            </View>
            <View style={styles.track}>
              <View style={{ height: '100%', width: `${v * 10}%`, backgroundColor: c, borderRadius: 3 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 12, padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.07)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.22)',
  },
  title: {
    fontSize: 12, fontWeight: '800', color: '#a78bfa',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { fontSize: 12, color: colors.textMuted },
  value: { fontSize: 12, fontWeight: '800' },
  track: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
});
