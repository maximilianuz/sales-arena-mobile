import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { EyeOff, X } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function PrivateInfoModal({ info, visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <GlassPanel style={{flex: 1, borderColor: colors.danger}}>
            <View style={styles.header}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <EyeOff color={colors.danger} size={24} />
                <Text style={styles.title}>Info Privada</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <X color={colors.textMuted} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              {info ? (
                <Text style={styles.text}>{info}</Text>
              ) : (
                <Text style={styles.emptyText}>No hay información privada en este escenario.</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={[globalStyles.btn, globalStyles.btnSecondary, {marginTop: 20}]} onPress={onClose}>
              <Text style={globalStyles.btnText}>Cerrar</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '70%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingBottom: 16,
  },
  title: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    paddingBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  iconBtn: {
    padding: 4,
  }
});
