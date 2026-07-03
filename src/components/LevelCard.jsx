import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { Flame, Target, Wallet, HandHeart } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { tierFromEarnings, tierLabel, formatMoney, TIERS } from '../utils/gamification';
import { earnedBadges, badgeLabel } from '../utils/badges';
import { colors } from '../theme/GlobalStyles';

const LAST_TIER_KEY = 'sales_arena_last_tier';

// "Cuenta bancaria del Closer" (móvil). Espejo del LevelCard web.
export default function LevelCard() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [stats, setStats] = useState(null);
  const [levelUp, setLevelUp] = useState(null); // tier al que acaba de ascender

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onValue(ref(db, `users/${uid}/stats`), (s) => {
      const val = s.val();
      setStats(val);
      if (!val) return;
      // Celebrar la subida de rango: comparamos con el último tier visto en
      // este dispositivo; si subió, overlay festivo una sola vez.
      const { tier: curTier } = tierFromEarnings(val.totalEarnings || 0);
      AsyncStorage.getItem(LAST_TIER_KEY).then(lastId => {
        const lastIdx = TIERS.findIndex(t => t.id === lastId);
        const curIdx = TIERS.findIndex(t => t.id === curTier.id);
        if (lastId && curIdx > lastIdx) {
          setLevelUp(curTier);
          setTimeout(() => setLevelUp(null), 3500);
        }
        AsyncStorage.setItem(LAST_TIER_KEY, curTier.id).catch(() => {});
      }).catch(() => { /* best effort */ });
    });
    return () => unsub();
  }, []);

  const total = stats?.totalEarnings || 0;
  const { tier, next, progress, toNext } = tierFromEarnings(total);
  const label = tierLabel(tier, i18n.language);
  const streak = stats?.streak || 0;
  const sessions = stats?.sessionsCompleted || 0;
  const supportPoints = stats?.supportPoints || 0;
  const badges = earnedBadges(stats || {});

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
        {supportPoints > 0 && (
          <View style={styles.stat}><HandHeart size={12} color="#8b5cf6" /><Text style={styles.meta}> {supportPoints.toLocaleString('en-US')} pts</Text></View>
        )}
      </View>

      {/* Insignias ganadas (derivadas de stats, sin escritura extra) */}
      {badges.length > 0 && (
        <View style={styles.badgeRow}>
          {badges.map(b => (
            <Text key={b.id} style={styles.badgeChip}>{b.icon} {badgeLabel(b, i18n.language)}</Text>
          ))}
        </View>
      )}

      {/* Overlay de subida de rango */}
      {levelUp && (
        <View style={[styles.levelUpOverlay, { backgroundColor: `${levelUp.color}ee` }]}>
          <Text style={{ fontSize: 30 }}>🎉</Text>
          <Text style={styles.levelUpTitle}>{isEn ? 'Rank up!' : '¡Subiste de rango!'}</Text>
          <Text style={styles.levelUpTier}>{tierLabel(levelUp, i18n.language)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,15,30,0.6)', borderWidth: 1, borderRadius: 18,
    padding: 16, marginBottom: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
    overflow: 'hidden',
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12, color: colors.textMuted },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  badgeChip: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, overflow: 'hidden',
  },
  levelUpOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', borderRadius: 18, zIndex: 2,
  },
  levelUpTitle: { fontWeight: '900', fontSize: 17, color: 'white', marginTop: 4 },
  levelUpTier: { fontWeight: '800', fontSize: 13, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 },
});
