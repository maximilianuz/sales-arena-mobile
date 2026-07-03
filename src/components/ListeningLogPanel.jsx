import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ear } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

// Espejo del ListeningLogPanel web. Fuerza al observador a escuchar activamente.
const FIELDS = [
  { id: 'quote', es: 'Cita textual clave', en: 'Key verbatim quote',
    hintEs: 'Palabra por palabra: ¿qué dijo el lead que revela lo que REALMENTE quiere?',
    hintEn: 'Word for word: what did the lead say that reveals what they REALLY want?' },
  { id: 'realPain', es: 'Dolor real', en: 'Real pain',
    hintEs: 'El dolor de fondo, más allá del síntoma que mencionó.',
    hintEn: 'The underlying pain, beyond the symptom they mentioned.' },
  { id: 'realObjection', es: 'Objeción real', en: 'Real objection',
    hintEs: 'La verdadera razón que lo frena (no la excusa que dijo).',
    hintEn: 'The true reason holding them back (not the excuse they gave).' },
  { id: 'keyMoment', es: 'Momento decisivo', en: 'Decisive moment',
    hintEs: '¿En qué momento el closer ganó o perdió al lead? ¿Por qué?',
    hintEn: 'When did the closer win or lose the lead? Why?' },
];

export default function ListeningLogPanel({ listeningLog, updateListeningLog, canEdit }) {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [local, setLocal] = useState(listeningLog || {});

  const commit = () => {
    if (canEdit && updateListeningLog) updateListeningLog(local);
  };

  return (
    <GlassPanel>
      <View style={styles.header}>
        <Ear size={18} color={colors.primary} />
        <Text style={styles.title}>Bitácora de Escucha Activa</Text>
      </View>
      <Text style={styles.sub}>Anotá lo que ESCUCHÁS. Este es tu entrenamiento de escucha activa.</Text>

      <View style={{ gap: 14 }}>
        {FIELDS.map((f) => (
          <View key={f.id}>
            <Text style={styles.label}>{isEn ? f.en : f.es}</Text>
            <Text style={styles.hint}>{isEn ? f.hintEn : f.hintEs}</Text>
            <TextInput
              style={styles.input}
              value={local[f.id] || ''}
              onChangeText={(v) => setLocal({ ...local, [f.id]: v })}
              onBlur={commit}
              editable={!!canEdit}
              multiline
              placeholder={canEdit ? '...' : 'Lo completa el observador'}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sub: { color: colors.textMuted, fontSize: 12, marginBottom: 14, lineHeight: 16 },
  label: { color: colors.textMain, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12, marginBottom: 6, lineHeight: 16 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: 8, padding: 10, color: colors.textMain, fontSize: 14,
    minHeight: 54, textAlignVertical: 'top',
  },
});
