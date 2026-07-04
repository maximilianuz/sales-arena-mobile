import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ref, onValue, query, orderByKey, startAt } from 'firebase/database';
import { ArrowLeft, Globe, Trophy, Zap, CheckCircle2 } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { tierFromEarnings, tierLabel, formatMoney } from '../utils/gamification';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from '../components/GlassPanel';

// Tabla de posiciones estilo Skool: 7 días / 30 días / histórico (espejo web).
// Ventanas rodantes agregadas client-side desde `leaderboard/daily`.

const MEDALS = ['🥇', '🥈', '🥉'];
const TOP_N = 50;

// Suma los buckets diarios por usuario → una fila por closer.
function aggregateDaily(daysData) {
  const agg = {};
  Object.values(daysData || {}).forEach(dayNode => {
    Object.entries(dayNode || {}).forEach(([uid, e]) => {
      const a = agg[uid] || (agg[uid] = { uid, name: '', earnings: 0, closes: 0, totalEarnings: 0 });
      a.earnings += e.earnings || 0;
      a.closes += e.closes || 0;
      a.totalEarnings = Math.max(a.totalEarnings, e.totalEarnings || 0);
      a.name = e.name || a.name;
    });
  });
  return Object.values(agg);
}

export default function LeaderboardScreen() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const router = useRouter();
  const [tab, setTab] = useState('week'); // 'week' | 'month' | 'all'
  // Guardamos {tab, list} juntos: si board.tab !== tab actual, está cargando.
  const [board, setBoard] = useState(null);
  const myUid = auth.currentUser?.uid;

  useEffect(() => {
    let unsub;
    if (tab === 'all') {
      unsub = onValue(ref(db, 'leaderboard/global'), snap => {
        const data = snap.val() || {};
        const list = Object.entries(data)
          .map(([uid, e]) => ({ uid, ...e, earnings: e.totalEarnings || 0 }))
          .filter(e => e.earnings > 0)
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, TOP_N);
        setBoard({ tab, list });
      }, () => setBoard({ tab, list: [] }));
    } else {
      const days = tab === 'week' ? 7 : 30;
      const startKey = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
      unsub = onValue(query(ref(db, 'leaderboard/daily'), orderByKey(), startAt(startKey)), snap => {
        const list = aggregateDaily(snap.val())
          .filter(e => e.earnings > 0)
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, TOP_N);
        setBoard({ tab, list });
      }, () => setBoard({ tab, list: [] }));
    }
    return () => unsub && unsub();
  }, [tab]);

  const entries = board && board.tab === tab ? board.list : null; // null = cargando
  const myRank = entries && myUid ? entries.findIndex(e => e.uid === myUid) + 1 : 0;

  const TABS = [
    { id: 'week', Icon: Zap, label: isEn ? '7 days' : '7 días' },
    { id: 'month', Icon: Trophy, label: isEn ? '30 days' : '30 días' },
    { id: 'all', Icon: Globe, label: isEn ? 'All-time' : 'Histórico' },
  ];

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>🏆 {isEn ? 'Leaderboard' : 'Tabla de posiciones'}</Text>
        </View>

        {/* Tabs estilo Skool */}
        <View style={styles.tabsRow}>
          {TABS.map(({ id, Icon, label }) => (
            <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActive]}>
              <Icon size={14} color={tab === id ? 'white' : colors.textMuted} />
              <Text style={[styles.tabText, tab === id && { color: 'white' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {myRank > 0 && (
          <Text style={styles.myRank}>{isEn ? `Your position: #${myRank}` : `Tu posición: #${myRank}`}</Text>
        )}

        <GlassPanel style={{ padding: 12 }}>
          {entries === null && <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />}
          {entries && entries.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Text style={{ fontSize: 30 }}>🏟️</Text>
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
                {tab === 'all'
                  ? (isEn ? 'The ranking is empty. Be the first.' : 'El ranking está vacío. Sé el primero.')
                  : (isEn ? 'No commissions in this period yet.' : 'Todavía no hay comisiones en este período.')}
              </Text>
            </View>
          )}
          {entries && entries.map((e, i) => {
            const { tier } = tierFromEarnings(e.totalEarnings || e.earnings || 0);
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
                <Text style={styles.money}>{formatMoney(e.earnings)}</Text>
              </View>
            );
          })}
        </GlassPanel>

        <Text style={styles.disclaimer}>
          {isEn
            ? 'Helping as Lead or Observer earns +10% team spirit; a week without helping costs -15%.'
            : 'Ayudar como Lead u Observador da +10% de bonus; una semana sin ayudar descuenta 15%.'}
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
