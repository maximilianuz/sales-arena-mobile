import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

// Mismas etapas que bloquea la web para el plan free.
const FREE_LOCKED_STAGES = ['cualificacion_diagnostico', 'cierre_transicion'];

// showDetail=false: solo la barra de etapas (el Closer ve el detalle en su
// centro de comando, no duplicado acá).
export default function PipelinePanel({ activeStageIndex, setActiveStageIndex, stages, pipelineQuestions, isFree, onUpgradeStage, showDetail = true }) {
  if (!stages || stages.length === 0) return null;

  const isLocked = (stage) => isFree && FREE_LOCKED_STAGES.includes(stage?.id);

  const idx = activeStageIndex || 0;
  const activeStage = stages[idx] || stages[0];
  const questions = pipelineQuestions?.[activeStage?.id];

  const onPressStage = (i, stage) => {
    if (!setActiveStageIndex) return;
    if (isLocked(stage)) { onUpgradeStage?.(); return; }
    setActiveStageIndex(i);
  };

  return (
    <View style={styles.container}>
      {/* Pestañas de etapas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {stages.map((stage, i) => {
          const isActive = i === idx;
          const isPast = i < idx;
          const locked = isLocked(stage);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onPressStage(i, stage)}
              disabled={!setActiveStageIndex}
              style={[
                styles.stagePill,
                isActive && !locked && styles.stageActive,
                isPast && !locked && styles.stagePast,
                locked && styles.stageLocked,
              ]}
            >
              {locked && <Lock size={11} color={colors.textMuted} style={{ marginRight: 4 }} />}
              <Text style={[
                styles.stageText,
                isActive && !locked && styles.textActive,
                isPast && !locked && styles.textPast,
              ]}>
                {i + 1}. {stage.label} ({stage.estimatedTime || 5}m)
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detalle de la etapa activa + preguntas del Closer */}
      {showDetail && (
      <GlassPanel style={styles.detail}>
        <Text style={styles.stageLabel}>{activeStage.label}</Text>
        {activeStage.objective ? (
          <Text style={styles.objective}>
            <Text style={styles.objectiveLabel}>Objetivo: </Text>{activeStage.objective}
          </Text>
        ) : null}
        {activeStage.indicator ? (
          <Text style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Éxito: </Text>{activeStage.indicator}
          </Text>
        ) : null}

        <Text style={styles.qTitle}>Preguntas sugeridas (High Ticket Closer)</Text>
        {Array.isArray(questions) && questions.length > 0 ? (
          questions.map((q, i) => (
            <Text key={i} style={styles.question}>• {q}</Text>
          ))
        ) : (
          <Text style={styles.hint}>Generá un escenario con IA para ver las preguntas dinámicas de esta etapa.</Text>
        )}
      </GlassPanel>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  scroll: { gap: 8, paddingHorizontal: 4 },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  stageActive: { backgroundColor: colors.primary, borderColor: colors.primaryHover },
  stagePast: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: colors.success },
  stageLocked: { backgroundColor: 'rgba(0,0,0,0.3)', borderStyle: 'dashed', opacity: 0.7 },
  stageText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  textActive: { color: 'white' },
  textPast: { color: colors.success },
  detail: { marginTop: 12 },
  stageLabel: { color: colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  objective: { color: colors.textMain, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  objectiveLabel: { color: colors.textMuted, fontWeight: '600' },
  indicator: { color: colors.textMain, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  indicatorLabel: { color: colors.success, fontWeight: '600' },
  qTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  question: { color: colors.textMain, fontSize: 14, lineHeight: 21, marginBottom: 6 },
  hint: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
});
