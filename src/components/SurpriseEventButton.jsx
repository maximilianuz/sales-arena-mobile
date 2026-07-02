import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Zap } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import { generateSurpriseEvent } from '../utils/universalAiClient';

export default function SurpriseEventButton({ currentScenario, triggerSurpriseEvent }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTrigger = async () => {
    if (!currentScenario || !triggerSurpriseEvent) return;
    setIsGenerating(true);

    try {
      // Va por el proxy del servidor (sin API key del usuario).
      const eventText = await generateSurpriseEvent(currentScenario, 'es');
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
