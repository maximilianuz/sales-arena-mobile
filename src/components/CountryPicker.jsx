import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { db, auth } from '../utils/db';
import { COUNTRIES, flagEmoji } from '../utils/countries';
import { colors } from '../theme/GlobalStyles';

// Selector de país del closer (bandera identificatoria). Escribe el código ISO-2
// en users/{uid}/country (regla: cada uno escribe solo el suyo). La bandera se
// propaga al leaderboard cuando el servidor analiza la próxima sesión.
// Espejo del CountryPicker.jsx web.
export default function CountryPicker({ visible, current, onClose, onSaved }) {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  const list = COUNTRIES
    .map(c => ({ ...c, label: isEn ? c.en : c.es }))
    .filter(c => c.label.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  const pick = async (code) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(code);
    setError('');
    try {
      await set(ref(db, `users/${uid}/country`), code);
      onSaved?.(code);
      onClose();
    } catch {
      setError(isEn ? 'Could not save (rules may need publishing).' : 'No se pudo guardar (quizás falta publicar las reglas).');
      setSaving('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{isEn ? 'Your country' : 'Tu país'}</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={isEn ? 'Search…' : 'Buscar…'}
            placeholderTextColor={colors.textMuted}
            style={styles.search}
          />
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <FlatList
            data={list}
            keyExtractor={c => c.code}
            style={{ maxHeight: 380 }}
            renderItem={({ item: c }) => (
              <TouchableOpacity
                onPress={() => pick(c.code)}
                disabled={!!saving}
                style={[styles.row, current === c.code && styles.rowActive]}
              >
                <Text style={{ fontSize: 18 }}>{flagEmoji(c.code)}</Text>
                <Text style={styles.rowLabel}>{c.label}</Text>
                {saving === c.code && <Text style={styles.saving}>…</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: {
    width: '100%', maxWidth: 400, borderRadius: 16, padding: 16,
    backgroundColor: '#14142a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '800', color: 'white' },
  search: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10, color: 'white', paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 8,
  },
  err: { color: colors.danger, fontSize: 12, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 8 },
  rowActive: { backgroundColor: 'rgba(94,92,230,0.15)', borderWidth: 1, borderColor: 'rgba(94,92,230,0.4)' },
  rowLabel: { flex: 1, color: 'white', fontSize: 14 },
  saving: { color: colors.textMuted, fontSize: 12 },
});
