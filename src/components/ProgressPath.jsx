import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ref, onValue, get } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { Map, ChevronDown, ChevronUp } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { progressionState, levelLabel } from '../utils/progression';
import { colors } from '../theme/GlobalStyles';

// "Camino del Closer" (móvil). Espejo del ProgressPath web: guía paso a paso
// Novato → Intermedio → Pro, rota por todos los roles, se adapta a equipo/solo.
export default function ProgressPath() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [stats, setStats] = useState(null);
  const [inCohort, setInCohort] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onValue(ref(db, `users/${uid}/stats`), (s) => setStats(s.val() || {}));
    get(ref(db, `users/${uid}/joinedCohort`)).then(s => setInCohort(!!s.val())).catch(() => {});
    return () => unsub();
  }, []);

  if (stats === null) return null;

  const { level, steps, doneCount, total, pending } = progressionState(stats, { inCohort });
  const allDone = pending.length === 0;
  const shown = expanded ? steps : pending.slice(0, 3);

  return (
    <View style={[styles.card, { borderColor: `${level.color}44` }]}>
      <TouchableOpacity style={styles.headerRow} onPress={() => setExpanded(!expanded)}>
        <Map size={15} color={level.color} />
        <Text style={styles.title}>{isEn ? 'Closer path' : 'Camino del Closer'}</Text>
        <Text style={[styles.levelChip, { color: level.color, borderColor: `${level.color}66`, backgroundColor: `${level.color}22` }]}>
          {level.icon} {levelLabel(level, i18n.language)}
        </Text>
        <Text style={styles.counter}>{doneCount}/{total}</Text>
        {expanded
          ? <ChevronUp size={14} color={colors.textMuted} />
          : <ChevronDown size={14} color={colors.textMuted} />}
      </TouchableOpacity>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${total ? Math.round(doneCount / total * 100) : 0}%`, backgroundColor: level.color }]} />
      </View>

      {allDone ? (
        <Text style={[styles.doneText, { color: level.color }]}>
          {isEn ? '🏁 Level complete — the next rank is earned in the arena.' : '🏁 Nivel completo — el próximo rango se gana en la arena.'}
        </Text>
      ) : (
        shown.map(st => (
          <View key={st.id} style={styles.stepRow}>
            <View style={[styles.check, st.done && styles.checkDone]}>
              {st.done && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.stepText, st.done && styles.stepTextDone]}>
              {st.icon} {isEn ? st.en : st.es}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,15,30,0.6)', borderWidth: 1, borderRadius: 16,
    padding: 14, marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontWeight: '800', fontSize: 13, color: 'white' },
  levelChip: {
    fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5,
    borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, overflow: 'hidden',
    marginRight: 'auto',
  },
  counter: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  track: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 10, marginBottom: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  doneText: { fontSize: 12, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  check: {
    width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { borderColor: colors.success, backgroundColor: colors.success },
  checkMark: { fontSize: 9, color: 'white', fontWeight: '900' },
  stepText: { fontSize: 12.5, color: 'white', flex: 1 },
  stepTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
