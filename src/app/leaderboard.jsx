import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ref, onValue } from 'firebase/database';
import { ArrowLeft, Globe, Trophy, Clock, CheckCircle2 } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { tierFromEarnings, tierLabel, formatMoney } from '../utils/gamification';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from '../components/GlassPanel';

// Tabla de posiciones mundial + torneo mensual (espejo de la página web).
// Lee los nodos `leaderboard/*` que escribe el servidor (analyze-session).

const MEDALS = ['🥇', '🥈', '🥉'];
const TOP_N = 50;

function currentSeason() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function daysLeftInMonth() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.max(0, Math.ceil((end - now) / 86400000));
}

function seasonLabel(lng) {
  const en = typeof lng === 'string' && lng.startsWith('en');
  return new Date().toLocaleDateString(en ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' });
}

export default function LeaderboardScreen() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const router = useRouter();
  const [tab, setTab] = useState('season');
  // Guardamos {tab, list} juntos: si board.tab !== tab actual, está cargando.
  const [board, setBoard] = useState(null);
  const myUid = auth.currentUser?.uid;

  useEffect(() => {
    const path = tab === 'season' ? `leaderboard/seasons/${currentSeason()}` : 'leaderboard/global';
    const unsub = onValue(ref(db, path), snap => {
      const data = snap.val() || {};
      const key = tab === 'season' ? 'earnings' : 'totalEarnings';
      const list = Object.entries(data)
        .map(([uid, e]) => ({ uid, ...e }))
        .filter(e => (e[key] || 0) > 0)
        .sort((a, b) => (b[key] || 0) - (a[key] || 0))
        .slice(0, TOP_N);
      setBoard({ tab, list });
    }, () => setBoard({ tab, list: [] }));
    return () => unsub();
  }, [tab]);

  const entries = board && board.tab === tab ? board.list : null; // null = cargando

  const myRank = entries && myUid ? entries.findIndex(e => e.uid === myUid) + 1 : 0;
  const days = daysLeftInMonth();

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>🏆 {isEn ? 'Leaderboard' : 'Tabla de posiciones'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {[
            { id: 'season', Icon: Trophy, label: isEn ? 'Tournament' : 'Torneo' },
            { id: 'global', Icon: Globe, label: isEn ? 'World' : 'Mundial' },
          ].map(({ id, Icon, label }) => (
            <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActive]}>
              <Icon size={14} color={tab === id ? 'white' : colors.textMuted} />
              <Text style={[styles.tabText, tab === id && { color: 'white' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'season' && (
          <View style={styles.countdownRow}>
            <Clock size={13} color={colors.accent} />
            <Text style={styles.countdown}>
              {' '}{seasonLabel(i18n.language)} · {isEn
                ? `${days} day${days === 1 ? '' : 's'} left`
                : `${days} día${days === 1 ? '' : 's'} restante${days === 1 ? '' : 's'}`}
            </Text>
          </View>
        )}

        {myRank > 0 && (
          <Text style={styles.myRank}>{isEn ? `Your position: #${myRank}` : `Tu posición: #${myRank}`}</Text>
        )}

        <GlassPanel style={{ padding: 12 }}>
          {entries === null && <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />}
          {entries && entries.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Text style={{ fontSize: 30 }}>🏟️</Text>
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
                {tab === 'season'
                  ? (isEn ? 'No commissions this month yet.' : 'Todavía no hay comisiones este mes.')
                  : (isEn ? 'The world ranking is empty. Be the first.' : 'El ranking mundial está vacío. Sé el primero.')}
              </Text>
            </View>
          )}
          {entries && entries.map((e, i) => {
            const earnings = tab === 'season' ? (e.earnings || 0) : (e.totalEarnings || 0);
            const { tier } = tierFromEarnings(e.totalEarnings ?? earnings);
            const medal = MEDALS[i];
            const isMe = e.uid === myUid;
            return (
              <View key={e.uid} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={[styles.rank, medal && { fontSize: 18 }]}>{medal || i + 1}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {e.name || 'Closer'}{isMe ? (isEn ? ' (you)' : ' (vos)') : ''}
                  </Text>
                  <Text style={[styles.tierText, { color: tier.color }]}>{tierLabel(tier, i18n.language)}</Text>
                </View>
                {(e.closes || 0) > 0 && (
                  <View style={styles.closesWrap}>
                    <CheckCircle2 size={12} color={colors.success} />
                    <Text style={styles.closes}> {e.closes}</Text>
                  </View>
                )}
                <Text style={styles.money}>{formatMoney(earnings)}</Text>
              </View>
            );
          })}
        </GlassPanel>

        <Text style={styles.disclaimer}>
          {isEn
            ? 'Commissions are simulated practice earnings. Rankings update after each analyzed session.'
            : 'Las comisiones son ganancias simuladas de práctica. El ranking se actualiza con cada sesión analizada.'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: 'white', flex: 1 },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: { backgroundColor: 'rgba(99,102,241,0.25)', borderColor: 'rgba(99,102,241,0.5)' },
  tabText: { fontWeight: '700', fontSize: 13, color: colors.textMuted },
  countdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  countdown: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  myRank: { fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, marginBottom: 2,
  },
  rowMe: { backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)' },
  rank: { width: 28, textAlign: 'center', fontWeight: '800', color: colors.textMuted, fontSize: 13 },
  name: { fontWeight: '700', color: 'white' },
  tierText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  closesWrap: { flexDirection: 'row', alignItems: 'center' },
  closes: { fontSize: 12, color: colors.success, fontWeight: '700' },
  money: { fontWeight: '900', fontSize: 15, color: 'white' },
  disclaimer: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 12 },
});
