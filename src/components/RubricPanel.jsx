import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';
import { RUBRIC_CRITERIA, getRubricLabel, rubricAverage } from '../utils/rubricCriteria';

// Rúbrica 1-5 que puntúa el Observador (o el Trainer). Espejo del RubricPanel web.
export default function RubricPanel({ rubric, updateRubric, canScore }) {
  const { i18n } = useTranslation();
  const scores = rubric || {};
  const avg = rubricAverage(scores);
  const avgColor = avg == null ? colors.textMuted : avg >= 4 ? colors.success : avg >= 2.5 ? colors.accent : colors.danger;

  const setScore = (id, value) => {
    if (canScore && updateRubric) updateRubric({ ...scores, [id]: value });
  };

  return (
    <GlassPanel>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ClipboardCheck size={18} color={colors.primary} />
          <Text style={styles.title}>Rúbrica de evaluación</Text>
        </View>
        {avg != null && <Text style={[styles.avg, { color: avgColor }]}>{avg}/5</Text>}
      </View>

      {!canScore && <Text style={styles.note}>La puntúa el observador.</Text>}

      <View style={{ gap: 12 }}>
        {RUBRIC_CRITERIA.map((c) => {
          const { label, hint } = getRubricLabel(c, i18n.language);
          const val = scores[c.id] || 0;
          return (
            <View key={c.id}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.hint}>{hint}</Text>
              <View style={styles.row}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    disabled={!canScore}
                    onPress={() => setScore(c.id, n)}
                    style={[styles.cell, n <= val ? styles.cellOn : styles.cellOff]}
                  >
                    <Text style={[styles.cellText, n <= val && { color: 'white' }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  avg: { fontWeight: '800', fontSize: 18 },
  note: { color: colors.textMuted, fontSize: 12, marginBottom: 10 },
  label: { color: colors.textMain, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12, marginBottom: 6, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1,
  },
  cellOn: { backgroundColor: colors.primary, borderColor: colors.primaryHover },
  cellOff: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.glassBorder },
  cellText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
});
