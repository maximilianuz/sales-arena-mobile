import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Zap } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, colors } from '../theme/GlobalStyles';
import { generateSurpriseEvent } from '../utils/universalAiClient';

export default function SurpriseEventButton({ currentScenario, triggerSurpriseEvent }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTrigger = async () => {
    if (!currentScenario || !triggerSurpriseEvent) return;
    setIsGenerating(true);

    try {
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

      const eventText = await generateSurpriseEvent(aiConfig, currentScenario, 'es');
      triggerSurpriseEvent(eventText);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setIsGenerating(false);
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleTrigger}
      disabled={isGenerating || !currentScenario}
    >
      {isGenerating ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Zap size={20} color="white" />
      )}
      <Text style={styles.text}>Evento Sorpresa</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
