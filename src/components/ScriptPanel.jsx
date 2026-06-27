import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function ScriptPanel({ script }) {
  if (!script) return null;

  return (
    <GlassPanel>
      <View style={styles.header}>
        <MessageSquare size={16} color={colors.primary} />
        <Text style={styles.title}>Guión de Apoyo (IA)</Text>
      </View>

      <View style={styles.content}>
        {script.split('\n').map((line, index) => {
          if (!line.trim()) return null;
          return (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          );
        })}
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
  content: {
    gap: 8,
  },
  line: {
    color: colors.textMain,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  }
});
