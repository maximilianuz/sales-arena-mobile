import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { Flame, Target, Wallet } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { tierFromEarnings, tierLabel, formatMoney } from '../utils/gamification';
import { colors } from '../theme/GlobalStyles';

// "Cuenta bancaria del Closer" (móvil). Espejo del LevelCard web.
export default function LevelCard() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onValue(ref(db, `users/${uid}/stats`), (s) => setStats(s.val()));
    return () => unsub();
  }, []);

  const total = stats?.totalEarnings || 0;
  const { tier, next, progress, toNext } = tierFromEarnings(total);
  const label = tierLabel(tier, i18n.language);
  const streak = stats?.streak || 0;
  const sessions = stats?.sessionsCompleted || 0;

  return (
    <View style={[styles.card, { borderColor: `${tier.color}55`, shadowColor: tier.color }]}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: tier.color }]}>
          <Wallet size={22} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{isEn ? 'Commission account' : 'Cuenta de comisiones'}</Text>
          <View style={styles.moneyRow}>
            <Text style={styles.money}>{formatMoney(total)}</Text>
            <Text style={[styles.tierChip, { color: tier.color, borderColor: `${tier.color}88`, backgroundColor: `${tier.color}22` }]}>{label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: tier.color }]} />
      </View>
      <View style={styles.metaRow}>
        {next
          ? <Text style={styles.meta}>{isEn ? `${formatMoney(toNext)} to ${tierLabel(next, i18n.language)}` : `${formatMoney(toNext)} para ${tierLabel(next, i18n.language)}`}</Text>
          : <Text style={[styles.meta, { color: tier.color, fontWeight: '700' }]}>{isEn ? 'Top rank 🏆' : 'Rango máximo 🏆'}</Text>}
        <View style={styles.stat}><Flame size={12} color={colors.accent} /><Text style={styles.meta}> {streak}</Text></View>
        <View style={styles.stat}><Target size={12} color={colors.textMuted} /><Text style={styles.meta}> {sessions}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,15,30,0.6)', borderWidth: 1, borderRadius: 18,
    padding: 16, marginBottom: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  moneyRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  money: { fontWeight: '900', fontSize: 26, color: 'white', letterSpacing: -0.5 },
  tierChip: {
    fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5,
    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, overflow: 'hidden',
  },
  track: { height: 7, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 12, marginBottom: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12, color: colors.textMuted },
});
