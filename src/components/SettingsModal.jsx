import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Save } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function SettingsModal({ visible, onClose, onSave }) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiModel, setApiModel] = useState('');

  useEffect(() => {
    if (visible) {
      AsyncStorage.multiGet(['api_provider', 'api_key', 'api_url', 'api_model']).then((vals) => {
        const dict = Object.fromEntries(vals);
        setProvider(dict.api_provider || 'openai');
        setApiKey(dict.api_key || '');
        setApiUrl(dict.api_url || '');
        setApiModel(dict.api_model || '');
      });
    }
  }, [visible]);

  const handleProviderSelect = (p) => {
    setProvider(p);
    if (p === 'openai') {
      setApiUrl('https://api.openai.com/v1/chat/completions');
      setApiModel('gpt-4o-mini');
    } else if (p === 'anthropic') {
      setApiUrl('https://api.anthropic.com/v1/messages');
      setApiModel('claude-3-5-sonnet-20240620');
    } else if (p === 'gemini') {
      setApiUrl(''); // Handled in client dynamically if empty
      setApiModel('gemini-1.5-flash');
    } else if (p === 'nvidia') {
      setApiUrl('https://integrate.api.nvidia.com/v1/chat/completions');
      setApiModel('meta/llama-3.1-8b-instruct');
    }
  };

  const handleSave = async () => {
    await AsyncStorage.multiSet([
      ['api_provider', provider],
      ['api_key', apiKey],
      ['api_url', apiUrl],
      ['api_model', apiModel],
    ]);
    
    // We also map back to the legacy keys for compatibility with Room.jsx if needed
    await AsyncStorage.multiSet([
      ['nvidia_api_key', apiKey], // Legacy
    ]);

    if (onSave) onSave({ provider, apiKey, apiUrl, apiModel });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <GlassPanel style={{flex: 1}}>
            <View style={styles.header}>
              <Text style={styles.title}>Configuración de IA</Text>
              <TouchableOpacity onPress={onClose}>
                <X color={colors.textMuted} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.label}>Proveedor de IA</Text>
              <View style={styles.providerGrid}>
                {['openai', 'anthropic', 'gemini', 'nvidia', 'custom'].map((p) => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.providerBtn, provider === p && styles.providerBtnActive]}
                    onPress={() => handleProviderSelect(p)}
                  >
                    <Text style={[styles.providerText, provider === p && {color: 'white'}]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>API Key</Text>
              <TextInput 
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />

              <Text style={styles.label}>Modelo</Text>
              <TextInput 
                style={styles.input}
                value={apiModel}
                onChangeText={setApiModel}
                placeholder="ej: gpt-4o"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Endpoint URL (Opcional si usas defaults)</Text>
              <TextInput 
                style={styles.input}
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, {marginTop: 20}]} onPress={handleSave}>
                <Save color="white" size={20} style={{marginRight: 8}} />
                <Text style={globalStyles.btnText}>Guardar Configuración</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassPanel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    paddingBottom: 40,
  },
  label: {
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  providerBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  providerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});
