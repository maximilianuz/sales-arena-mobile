import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { User, Briefcase, Target, AlertTriangle, Sparkles } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';
import { generateAIScenario } from '../utils/universalAiClient';
import { randomIndustryValue } from '../utils/industries';

// Fila etiqueta + valor. No renderiza nada si el valor está vacío.
function Field({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SectionTitle({ Icon, color, text }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={15} color={color} />
      <Text style={styles.sectionTitle}>{text}</Text>
    </View>
  );
}

export default function BuyerPersonaPanel({ currentScenario, setCurrentScenario, stages, isFacilitator }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRandomizeAndGenerate = async () => {
    if (!setCurrentScenario) return;
    setIsGenerating(true);

    try {
      // Ya no se pide API key: la generación va por el proxy del servidor con la
      // sesión del usuario (misma cuota/plan que la web).
      const levels = ["Intermedio", "Avanzado"];
      const temps = ["Frío", "Templado"];

      const scenarioConfig = {
        theme: randomIndustryValue(),
        level: levels[Math.floor(Math.random() * levels.length)],
        leadTemperature: temps[Math.floor(Math.random() * temps.length)],
        targetObjection: "Aleatoria (Sorpréndeme)"
      };

      const scenario = await generateAIScenario(scenarioConfig, stages, 'es');
      await setCurrentScenario(scenario);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setIsGenerating(false);
  };

  const renderContent = () => {
    if (!currentScenario) {
      return <Text style={{ color: colors.textMuted }}>Esperando a que el Trainer genere el escenario...</Text>;
    }

    const s = currentScenario;
    const name = s.demographics?.name || s.name || 'Desconocido';
    const roleStr = s.demographics?.role || s.role || '';
    const company = s.demographics?.industry || s.company || '';
    const age = s.demographics?.age;
    const psych = s.psychology || {};
    const beh = s.behavioralCues || {};
    const sit = s.currentSituation || {};
    const guide = s.roleplayGuide || {};
    const secondary = Array.isArray(s.secondaryObjections) ? s.secondaryObjections.filter(Boolean) : [];
    const objection = s.visibleObjection || (s.painPoints ? s.painPoints[0] : '');
    const subtitle = [roleStr, company].filter(Boolean).join(' · ') + (age ? ` · ${age}` : '');

    return (
      <View>
        <View style={styles.header}>
          <User size={20} color={colors.primary} />
          <Text style={styles.title}>{name}</Text>
        </View>
        {subtitle.trim() ? (
          <View style={styles.companyRow}>
            <Briefcase size={16} color={colors.textMuted} />
            <Text style={styles.companyText}>{subtitle}</Text>
          </View>
        ) : null}

        <SectionTitle Icon={Target} color={colors.accent} text="Situación" />
        <Field label="Problema actual" value={sit.problem} />
        <Field label="Qué lo trajo ahora" value={sit.triggerEvent} />
        <Field label="Intentos previos" value={sit.previousAttempts} />
        <Field label="Impacto si no lo resuelve" value={sit.impact} />

        <SectionTitle Icon={AlertTriangle} color={colors.secondary} text="Objeciones" />
        {objection ? <Text style={styles.objection}>&ldquo;{objection}&rdquo;</Text> : null}
        {secondary.length > 0 ? <Field label="Secundarias" value={secondary.join(' · ')} /> : null}
        <Field label="Objeción oculta (solo Trainer)" value={s.hiddenObjection} />

        <SectionTitle Icon={Target} color={colors.primary} text="Psicología" />
        <Field label="Urgencia" value={psych.urgency} />
        <Field label="Estilo de comunicación" value={psych.communicationStyle} />
        <Field label="Miedo profundo" value={psych.primaryFear} />
        <Field label="Deseo real" value={psych.primaryDesire} />
        <Field label="Estilo de decisión" value={psych.decisionStyle} />
        <Field label="Qué genera o rompe su confianza" value={psych.trustTrigger} />

        <SectionTitle Icon={AlertTriangle} color={colors.accent} text="Señales de comportamiento" />
        <Field label="Se abre cuando" value={beh.opensUpWhen} />
        <Field label="Se cierra cuando" value={beh.shutsDownWhen} />
        <Field label="Cómo habla" value={beh.verbalStyle} />

        {(guide.actorAdvice || guide.moneyBelief || guide.competingGoal) ? (
          <>
            <SectionTitle Icon={Sparkles} color={colors.success} text="Guía de actuación (para el Lead)" />
            <Field label="Cómo actuarlo" value={guide.actorAdvice} />
            <Field label="Creencia sobre el dinero" value={guide.moneyBelief} />
            <Field label="Conflicto interno" value={guide.competingGoal} />
            <Field label="Por qué desconfía de vendedores" value={guide.vendorFatigue} />
          </>
        ) : null}
      </View>
    );
  };

  return (
    <GlassPanel>
      {isFacilitator && (
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnPrimary, { flexDirection: 'row', gap: 8 }]}
            onPress={handleRandomizeAndGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Sparkles size={16} color="white" />
            )}
            <Text style={globalStyles.btnText}>
              {isGenerating ? "Generando..." : "Generar Escenario Aleatorio"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {renderContent()}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  companyText: {
    color: colors.textMuted,
    fontSize: 14,
    flexShrink: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  fieldValue: {
    color: colors.textMain,
    fontSize: 14,
    lineHeight: 20,
  },
  objection: {
    color: colors.secondary,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 10,
  },
});
