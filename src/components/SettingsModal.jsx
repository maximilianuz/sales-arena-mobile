import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Save } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function SettingsModal({ visible, onClose, onSave, roomConfig, onSaveConfig, stages }) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiModel, setApiModel] = useState('');

  // Producto real + comisión + etapa a practicar (config de la sala).
  const [commissionPct, setCommissionPct] = useState('10');
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [focusStageId, setFocusStageId] = useState('all');

  useEffect(() => {
    if (visible) {
      AsyncStorage.multiGet(['api_provider', 'api_key', 'api_url', 'api_model']).then((vals) => {
        const dict = Object.fromEntries(vals);
        setProvider(dict.api_provider || 'openai');
        setApiKey(dict.api_key || '');
        setApiUrl(dict.api_url || '');
        setApiModel(dict.api_model || '');
      });
      const rc = roomConfig || {};
      const rp = rc.realProduct || {};
      setCommissionPct(String(rc.commissionPct ?? 10));
      setProdName(rp.name || '');
      setProdDesc(rp.description || '');
      setProdPrice(rp.price ? String(rp.price) : '');
      setFocusStageId(rc.focusStageId || 'all');
    }
  }, [visible, roomConfig]);

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

    if (onSaveConfig) {
      const price = parseInt(prodPrice, 10);
      const realProduct = prodName.trim()
        ? { name: prodName.trim(), description: prodDesc.trim(), price: price > 0 ? price : 1500 }
        : null;
      onSaveConfig({ commissionPct: Number(commissionPct) || 0, realProduct, focusStageId });
    }
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

              <View style={{ height: 1, backgroundColor: colors.glassBorder, marginTop: 24, marginBottom: 4 }} />
              <Text style={[styles.label, { color: colors.accent }]}>Etapa a practicar</Text>
              <View style={styles.providerGrid}>
                {[{ id: 'all', label: 'Toda la venta' }, ...((stages || []).map((s) => ({ id: s.id, label: s.label })))].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.providerBtn, focusStageId === opt.id && styles.providerBtnActive]}
                    onPress={() => setFocusStageId(opt.id)}
                  >
                    <Text style={[styles.providerText, focusStageId === opt.id && { color: 'white' }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                Enfocá la sesión en una etapa (ej. solo Cierre) o en toda la venta.
              </Text>

              <Text style={[styles.label, { color: colors.accent }]}>Comisión (% del precio)</Text>
              <TextInput
                style={styles.input}
                value={commissionPct}
                onChangeText={setCommissionPct}
                placeholder="10"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                Lo que gana el closer al cerrar un trato (alimenta su cuenta de comisiones).
              </Text>

              <Text style={[styles.label, { color: colors.accent }]}>Tu producto REAL (opcional)</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>
                Si lo completás, los escenarios generan un lead prospecto de ESTE producto. Vacío = aleatorio.
              </Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                value={prodName}
                onChangeText={setProdName}
                placeholder="Nombre del producto / servicio"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { marginBottom: 8, minHeight: 70, textAlignVertical: 'top' }]}
                value={prodDesc}
                onChangeText={setProdDesc}
                placeholder="Descripción corta (qué es, beneficios clave)"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <TextInput
                style={styles.input}
                value={prodPrice}
                onChangeText={setProdPrice}
                placeholder="Precio en USD (mín. 1500)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
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
