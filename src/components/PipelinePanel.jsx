import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function PipelinePanel({ activeStageIndex, setActiveStageIndex, stages }) {
  if (!stages || stages.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {stages.map((stage, idx) => {
          const isActive = idx === activeStageIndex;
          const isPast = idx < activeStageIndex;

          return (
            <TouchableOpacity 
              key={idx} 
              onPress={() => setActiveStageIndex && setActiveStageIndex(idx)}
              disabled={!setActiveStageIndex}
              style={[
                styles.stagePill,
                isActive && styles.stageActive,
                isPast && styles.stagePast
              ]}
            >
              <Text style={[
                styles.stageText,
                isActive && styles.textActive,
                isPast && styles.textPast
              ]}>
                {idx + 1}. {stage.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  scroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  stagePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  stageActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  stagePast: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
  },
  stageText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  textActive: {
    color: 'white',
  },
  textPast: {
    color: colors.success,
  }
});
