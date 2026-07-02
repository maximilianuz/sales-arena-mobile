import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, MessageSquare, ChevronDown, ChevronUp, Package, Zap, Ear, Brain, Volume2, AlertTriangle, Fingerprint } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';
import { getStageCoaching } from '../utils/coachingKnowledge';
import { getPersonality, personalityView } from '../utils/leadPersonalities';

// Fila compacta del coach: icono + etiqueta + consejo. Espejo del CoachRow web.
function CoachRow({ Icon, color, label, text }) {
  return (
    <View style={styles.coachRow}>
      <Icon size={15} color={color} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.coachLabel, { color }]}>{label}</Text>
        <Text style={styles.coachText}>{text}</Text>
      </View>
    </View>
  );
}

function IntelTile({ label, color, bg, text, italic }) {
  if (!text) return null;
  return (
    <View style={[styles.intelTile, { borderColor: `${color}44`, backgroundColor: bg }]}>
      <Text style={[styles.intelLabel, { color }]}>{label}</Text>
      <Text style={[styles.intelText, italic && { fontStyle: 'italic' }]}>{text}</Text>
    </View>
  );
}

export default function CloserCommandPanel({ currentScenario, activeStage, pipelineQuestions, productPresentation }) {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const [showProduct, setShowProduct] = useState(false);

  const questions = pipelineQuestions && activeStage ? pipelineQuestions[activeStage.id] : [];
  const coaching = getStageCoaching(activeStage?.id, i18n.language);
  const persona = currentScenario ? personalityView(getPersonality(currentScenario.personality), i18n.language) : null;

  if (!currentScenario || !activeStage) {
    return (
      <GlassPanel style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.7 }}>
        <Zap size={36} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: 10, textAlign: 'center' }}>
          {isEn ? 'Waiting for the Trainer to generate the scenario...' : 'Esperando que el Trainer genere el escenario...'}
        </Text>
      </GlassPanel>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      {/* Misión de la etapa */}
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View style={styles.missionIcon}>
            <Target size={13} color="white" />
          </View>
          <Text style={styles.missionKicker}>{isEn ? `Stage ${activeStage.label}` : `Etapa ${activeStage.label}`}</Text>
          <Text style={styles.missionTime}>{activeStage.estimatedTime || 5}min</Text>
        </View>
        <Text style={styles.missionObjective}>{activeStage.objective}</Text>
        {activeStage.indicator ? (
          <View style={styles.winSignal}>
            <Text style={{ color: colors.success, fontSize: 12 }}>✓</Text>
            <Text style={styles.winSignalText}>
              <Text style={{ color: colors.success, fontWeight: '700' }}>{isEn ? 'Win signal: ' : 'Señal de éxito: '}</Text>
              {activeStage.indicator}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Perfil de personalidad del lead + cómo venderle */}
      {persona && (
        <GlassPanel style={{ borderColor: `${persona.color}55`, gap: 6 }}>
          <View style={styles.personaHeader}>
            <Fingerprint size={15} color={persona.color} />
            <Text style={[styles.personaTitle, { color: persona.color }]}>
              {isEn ? 'Lead profile' : 'Perfil del lead'}: {persona.name}
            </Text>
          </View>
          <Text style={styles.personaEssence}>{persona.essence}</Text>
          <Text style={styles.personaLine}><Text style={{ color: colors.success, fontWeight: '700' }}>{isEn ? 'Connect: ' : 'Conectá: '}</Text>{persona.connect}</Text>
          <Text style={styles.personaLine}><Text style={{ color: '#a5b4fc', fontWeight: '700' }}>{isEn ? 'Close: ' : 'Cerrá: '}</Text>{persona.close}</Text>
          <Text style={styles.personaLine}><Text style={{ color: colors.danger, fontWeight: '700' }}>{isEn ? 'Avoid: ' : 'Evitá: '}</Text>{persona.avoid}</Text>
          <Text style={styles.personaLine}><Text style={{ color: colors.accent, fontWeight: '700' }}>{isEn ? 'Tone: ' : 'Tono: '}</Text>{persona.tone}</Text>
        </GlassPanel>
      )}

      {/* Coach de etapa (curado, siempre disponible) */}
      {coaching && (
        <GlassPanel style={{ gap: 12 }}>
          <CoachRow Icon={Ear} color="#a5b4fc" label={isEn ? 'What to listen for' : 'Qué escuchar'} text={coaching.lookFor} />
          <CoachRow Icon={Volume2} color={colors.accent} label={isEn ? 'Voice tone' : 'Tono de voz'} text={coaching.tonality} />
          <CoachRow Icon={Brain} color={colors.success} label={isEn ? 'Mindset · NLP' : 'Mente · PNL'} text={coaching.mindset} />
          <CoachRow Icon={AlertTriangle} color={colors.danger} label={isEn ? 'Avoid' : 'Evitá'} text={coaching.avoid} />
        </GlassPanel>
      )}

      {/* Preguntas: dinámicas del lead (IA) + consultivas curadas */}
      {((questions && questions.length > 0) || coaching?.socratic?.length > 0) && (
        <View style={styles.questionsCard}>
          <View style={styles.qHeader}>
            <MessageSquare size={14} color={colors.success} />
            <Text style={styles.qKicker}>{isEn ? 'Your questions for this stage' : 'Tus preguntas para esta etapa'}</Text>
          </View>
          {questions && questions.length > 0 && questions.map((q, i) => (
            <Text key={`ai-${i}`} style={styles.question}>• {q}</Text>
          ))}
          {coaching?.socratic?.length > 0 && (
            <>
              <Text style={styles.socraticDivider}>
                {isEn ? 'CONSULTATIVE — ALWAYS WORK' : 'CONSULTIVAS — SIEMPRE FUNCIONAN'}
              </Text>
              {coaching.socratic.map((q, i) => (
                <Text key={`so-${i}`} style={styles.socraticQ}>• {q}</Text>
              ))}
            </>
          )}
        </View>
      )}

      {/* Intel del lead */}
      <View style={{ gap: 8 }}>
        <IntelTile
          label={isEn ? 'Main objection' : 'Objeción principal'}
          color={colors.accent}
          bg="rgba(245,158,11,0.07)"
          text={currentScenario.visibleObjection ? `"${currentScenario.visibleObjection}"` : null}
          italic
        />
        <IntelTile
          label={isEn ? 'Core fear' : 'Miedo central'}
          color={colors.danger}
          bg="rgba(239,68,68,0.07)"
          text={currentScenario.psychology?.primaryFear}
        />
        <IntelTile
          label={isEn ? 'Opens up when' : 'Se abre cuando'}
          color={colors.success}
          bg="rgba(16,185,129,0.06)"
          text={currentScenario.behavioralCues?.opensUpWhen}
        />
        <IntelTile
          label={isEn ? 'Builds trust' : 'Genera confianza'}
          color="#a5b4fc"
          bg="rgba(99,102,241,0.06)"
          text={currentScenario.psychology?.trustTrigger}
        />
      </View>

      {/* Producto — colapsable */}
      {productPresentation ? (
        <View style={styles.productCard}>
          <TouchableOpacity style={styles.productToggle} onPress={() => setShowProduct(!showProduct)}>
            <Package size={14} color={colors.textMuted} />
            <Text style={styles.productKicker}>{isEn ? 'Product reference' : 'Referencia del producto'}</Text>
            {showProduct
              ? <ChevronUp size={14} color={colors.textMuted} />
              : <ChevronDown size={14} color={colors.textMuted} />}
          </TouchableOpacity>
          {showProduct && (
            <Text style={styles.productText}>
              {typeof productPresentation === 'object' ? (productPresentation.description || productPresentation.name || '') : productPresentation}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  missionCard: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: 16,
    padding: 16,
  },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  missionIcon: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  missionKicker: {
    flex: 1, fontSize: 11, fontWeight: '800', letterSpacing: 1,
    textTransform: 'uppercase', color: '#a5b4fc',
  },
  missionTime: { fontSize: 12, color: 'rgba(165,180,252,0.5)' },
  missionObjective: { color: 'white', fontWeight: '700', fontSize: 15, lineHeight: 21 },
  winSignal: {
    flexDirection: 'row', gap: 6, marginTop: 10, padding: 10,
    backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  winSignalText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  personaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  personaTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 1 },
  personaEssence: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 19, marginBottom: 4 },
  personaLine: { fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 19 },
  coachRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  coachLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  coachText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 },
  questionsCard: {
    backgroundColor: 'rgba(16,185,129,0.06)',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: 16, padding: 16,
  },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  qKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: colors.success },
  question: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 21, marginBottom: 6 },
  socraticDivider: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    color: 'rgba(255,255,255,0.35)', marginTop: 10, marginBottom: 6,
  },
  socraticQ: { fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 20, marginBottom: 5 },
  intelTile: { borderWidth: 1, borderRadius: 12, padding: 12 },
  intelLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  intelText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, overflow: 'hidden',
  },
  productToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  productKicker: {
    flex: 1, fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', color: colors.textMuted,
  },
  productText: { paddingHorizontal: 14, paddingBottom: 14, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20 },
});
