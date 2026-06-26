import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function RolesPanel({ participants }) {
  return (
    <GlassPanel>
      <View style={styles.header}>
        <Users size={16} color={colors.textMain} />
        <Text style={styles.title}>Participantes</Text>
      </View>
      <View style={styles.list}>
        {participants && participants.length > 0 ? (
          participants.map((p, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.role}>{p.role}</Text>
            </View>
          ))
        ) : (
          <Text style={{color: colors.textMuted}}>Esperando participantes...</Text>
        )}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  name: {
    color: 'white',
  },
  role: {
    color: colors.textMuted,
    fontSize: 12,
  }
});
