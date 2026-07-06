import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { X, Globe } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { flagEmoji, countryName } from '../utils/countries';
import { colors } from '../theme/GlobalStyles';

// Mini-reloj mundial NATIVO (espejo del WorldClockPanel.jsx web): cada
// participante escribe su huso horario real (Intl del dispositivo) + bandera a
// rooms/{id}/clocks/{uid}, y todos ven la hora local del resto y la diferencia.

function localTime(tz, base) {
  try {
    return new Intl.DateTimeFormat('es', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(base);
  } catch {
    return '--:--';
  }
}

function hourDiff(tz, myTz, base) {
  try {
    const fmt = (zone) => {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'shortOffset' }).formatToParts(base);
      const off = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
      const m = /GMT([+-]?\d{1,2})(?::(\d{2}))?/.exec(off);
      if (!m) return 0;
      return parseInt(m[1], 10) + (m[2] ? Math.sign(parseInt(m[1], 10) || 1) * parseInt(m[2], 10) / 60 : 0);
    };
    return Math.round((fmt(tz) - fmt(myTz)) * 10) / 10;
  } catch {
    return 0;
  }
}

export default function WorldClockPanel({ visible, roomId, userName, onClose }) {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [clocks, setClocks] = useState({});
  const [now, setNow] = useState(() => new Date());
  const myTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const myUid = auth.currentUser?.uid;

  // Registrar mi reloj (tz real del dispositivo + bandera) al abrir.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!visible || !uid || !roomId) return;
    (async () => {
      let country = null;
      try { country = (await get(ref(db, `users/${uid}/country`))).val(); } catch { /* opcional */ }
      set(ref(db, `rooms/${roomId}/clocks/${uid}`), {
        name: userName || 'Closer',
        tz: myTz,
        country: country || null,
        updatedAt: Date.now(),
      }).catch(() => { /* best effort */ });
    })();
  }, [visible, roomId, userName, myTz]);

  // Leer todos los relojes de la sala.
  useEffect(() => {
    if (!visible || !roomId) return;
    const unsub = onValue(ref(db, `rooms/${roomId}/clocks`), (s) => setClocks(s.val() || {}));
    return () => unsub();
  }, [visible, roomId]);

  // Refrescar la hora cada 20s mientras está abierto.
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, [visible]);

  const rows = Object.entries(clocks)
    .map(([uid, c]) => ({ uid, ...c }))
    .sort((a, b) => (a.uid === myUid ? -1 : b.uid === myUid ? 1 : 0));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <Globe size={18} color={colors.primary} />
            <Text style={styles.title}>{isEn ? 'Time zones' : 'Husos horarios'}</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            {rows.length === 0 && (
              <Text style={styles.empty}>{isEn ? 'Waiting for participants…' : 'Esperando participantes…'}</Text>
            )}
            {rows.map(r => {
              const isMe = r.uid === myUid;
              const diff = isMe ? 0 : hourDiff(r.tz, myTz, now);
              return (
                <View key={r.uid} style={styles.row}>
                  <Text style={styles.flag}>{r.country ? flagEmoji(r.country) : '🌐'}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {r.name}{isMe ? (isEn ? ' (you)' : ' (vos)') : ''}
                    </Text>
                    <Text style={styles.tz} numberOfLines={1}>
                      {r.country ? countryName(r.country, i18n.language) + ' · ' : ''}{r.tz}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.time}>{localTime(r.tz, now)}</Text>
                    {!isMe && diff !== 0 && (
                      <Text style={styles.diff}>{diff > 0 ? '+' : ''}{diff}h {isEn ? 'vs you' : 'vs vos'}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: {
    width: '100%', maxWidth: 420, borderRadius: 16, padding: 16,
    backgroundColor: '#14142a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: 'white' },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  flag: { fontSize: 20, width: 28, textAlign: 'center' },
  name: { fontWeight: '700', fontSize: 14, color: 'white' },
  tz: { fontSize: 11, color: colors.textMuted },
  time: { fontWeight: '800', fontSize: 15, color: 'white', fontVariant: ['tabular-nums'] },
  diff: { fontSize: 11, color: colors.textMuted },
});
