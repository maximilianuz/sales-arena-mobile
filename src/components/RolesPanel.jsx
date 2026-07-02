import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Users, Plus, X } from 'lucide-react-native';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

const ROLES = ['Trainer', 'Closer', 'Lead', 'Observador'];

export default function RolesPanel({ participants, setParticipants }) {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Closer');
  const list = participants || [];

  const addParticipant = () => {
    if (!name.trim() || !setParticipants) return;
    setParticipants([...list, { name: name.trim(), role: selectedRole }]);
    setName('');
  };

  const removeParticipant = (idx) => {
    if (!setParticipants) return;
    setParticipants(list.filter((_, i) => i !== idx));
  };

  return (
    <GlassPanel>
      <View style={styles.header}>
        <Users size={16} color={colors.textMain} />
        <Text style={styles.title}>Participantes</Text>
      </View>

      {setParticipants && (
        <>
          <View style={styles.roleChips}>
            {ROLES.map((r) => {
              const active = selectedRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedRole(r)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del participante..."
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addParticipant}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addParticipant}>
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.list}>
        {list.length > 0 ? (
          list.map((p, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.name}>{p.name}</Text>
              <View style={styles.rowRight}>
                {p.role ? <Text style={styles.roleBadge}>{p.role}</Text> : null}
                {setParticipants && (
                  <TouchableOpacity onPress={() => removeParticipant(idx)} hitSlop={8}>
                    <X size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted }}>Todavía no agregaste participantes.</Text>
        )}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primaryHover },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textMain,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: 'white', fontSize: 14 },
  roleBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
