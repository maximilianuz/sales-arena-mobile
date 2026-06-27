import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { User, Briefcase, Target, AlertTriangle, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';
import { generateAIScenario } from '../utils/universalAiClient';

export default function BuyerPersonaPanel({ currentScenario, setCurrentScenario, stages, isFacilitator }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRandomizeAndGenerate = async () => {
    if (!setCurrentScenario) return;
    setIsGenerating(true);

    try {
      // Get config from AsyncStorage
      const vals = await AsyncStorage.multiGet(['api_provider', 'api_key', 'api_url', 'api_model']);
      const dict = Object.fromEntries(vals);

      const aiConfig = {
        provider: dict.api_provider || 'openai',
        apiKey: dict.api_key || '',
        apiUrl: dict.api_url || '',
        apiModel: dict.api_model || ''
      };

      if (!aiConfig.apiKey && aiConfig.provider !== 'custom') {
        Alert.alert('Falta API Key', 'Por favor configura tu API Key en los ajustes.');
        setIsGenerating(false);
        return;
      }

      const themes = ["B2B Software/SaaS", "B2C Inmobiliario", "B2C Seguros", "E-commerce"];
      const levels = ["Intermedio", "Avanzado"];
      const temps = ["Frío", "Templado"];

      const scenarioConfig = {
        theme: themes[Math.floor(Math.random() * themes.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        leadTemperature: temps[Math.floor(Math.random() * temps.length)],
        targetObjection: "Aleatoria (Sorpréndeme)"
      };

      const scenario = await generateAIScenario(aiConfig, scenarioConfig, stages, 'es');
      await setCurrentScenario(scenario);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setIsGenerating(false);
  };

  const renderContent = () => {
    if (!currentScenario) {
      return <Text style={{color: colors.textMuted}}>Esperando configuración de escenario...</Text>;
    }

    const name = currentScenario.demographics?.name || currentScenario.name || 'Desconocido';
    const roleStr = currentScenario.demographics?.role || currentScenario.role || 'Rol no definido';
    const companyStr = currentScenario.demographics?.industry || currentScenario.company || 'Industria no definida';
    const problemStr = currentScenario.currentSituation?.problem || currentScenario.context || 'Problema no definido';
    const objectionStr = currentScenario.visibleObjection || (currentScenario.painPoints ? currentScenario.painPoints[0] : 'No definida');

    return (
      <View>
        <View style={styles.header}>
          <User size={20} color={colors.primary} />
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.badge}>{roleStr}</Text>
        </View>
        
        <View style={styles.companyRow}>
          <Briefcase size={16} color={colors.textMuted} />
          <Text style={styles.companyText}>{companyStr}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={16} color={colors.accent} />
            <Text style={styles.sectionTitle}>Problema Actual</Text>
          </View>
          <Text style={styles.text}>{problemStr}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={16} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Objeción Principal</Text>
          </View>
          <Text style={[styles.text, { fontStyle: 'italic', color: colors.secondary }]}>"{objectionStr}"</Text>
        </View>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  companyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  listItem: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  }
});
