import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function DebriefPanel({ roomNotes, updateDebriefNotes, isObserver, isFacilitator }) {
  const [localNotes, setLocalNotes] = useState(roomNotes || {});

  useEffect(() => {
    // Only update local notes from server if we are not actively typing, or just forcefully sync it.
    // For simplicity, we sync on every change from server.
    setLocalNotes(roomNotes || {});
  }, [roomNotes]);

  const handleChange = (key, text) => {
    setLocalNotes(prev => ({ ...prev, [key]: text }));
  };

  const handleBlur = () => {
    if (updateDebriefNotes) {
      updateDebriefNotes(localNotes);
    }
  };

  const canEdit = isObserver || isFacilitator;

  return (
    <GlassPanel>
      <View style={styles.header}>
        <ClipboardList size={16} color={colors.textMain} />
        <Text style={styles.title}>Retrospectiva y Mejora Continua</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>¿Cómo podríamos hacerlo aún mejor?</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          value={localNotes.q1 || ''}
          onChangeText={(text) => handleChange('q1', text)}
          onBlur={handleBlur}
          placeholder="Tus notas aquí..."
          placeholderTextColor={colors.textMuted}
          editable={canEdit}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>¿Qué elementos podríamos agregar para fortalecer la venta?</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          value={localNotes.q2 || ''}
          onChangeText={(text) => handleChange('q2', text)}
          onBlur={handleBlur}
          placeholder="Tus notas aquí..."
          placeholderTextColor={colors.textMuted}
          editable={canEdit}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>¿Qué funcionó bien y debe mantenerse?</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          value={localNotes.q3 || ''}
          onChangeText={(text) => handleChange('q3', text)}
          onBlur={handleBlur}
          placeholder="Tus notas aquí..."
          placeholderTextColor={colors.textMuted}
          editable={canEdit}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>¿Qué aspectos podríamos dejar fuera o mejorar?</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          value={localNotes.q4 || ''}
          onChangeText={(text) => handleChange('q4', text)}
          onBlur={handleBlur}
          placeholder="Tus notas aquí..."
          placeholderTextColor={colors.textMuted}
          editable={canEdit}
        />
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 8,
    color: 'white',
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  }
});
