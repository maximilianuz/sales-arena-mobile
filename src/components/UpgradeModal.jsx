import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Lock, X, Zap } from 'lucide-react-native';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

// Espejo del UpgradeModal de la web. Se muestra cuando un usuario free toca una
// función bloqueada (etapas Cualificación/Cierre, etc.).
export default function UpgradeModal({ visible, feature, requiredPlan = 'closer', onClose, onUpgrade }) {
  const planLabel = requiredPlan === 'trainer' ? 'Trainer' : 'Closer';
  const planPrice = requiredPlan === 'trainer' ? '$97/mes' : '$19/mes';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel}>
          <TouchableOpacity onPress={onClose} style={styles.close} hitSlop={10}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Lock size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Función premium</Text>
          <Text style={styles.sub}>
            <Text style={styles.feature}>{feature}</Text> está disponible en el Plan {planLabel}.
          </Text>

          <View style={styles.planBox}>
            <View style={styles.planRow}>
              <Zap size={16} color={colors.primary} />
              <Text style={styles.planName}>Plan {planLabel} — {planPrice}</Text>
            </View>
            <Text style={styles.planDesc}>
              Desbloqueá todas las etapas del pipeline, sesiones ilimitadas y más.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, { flex: 1 }]} onPress={onClose}>
              <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Más tarde</Text>
            </TouchableOpacity>
            {onUpgrade && (
              <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { flex: 2 }]} onPress={onUpgrade}>
                <Text style={globalStyles.btnText}>Ver planes</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassPanel>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: { maxWidth: 400, width: '100%' },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4 },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(94, 92, 230, 0.15)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.textMain, textAlign: 'center', marginBottom: 6 },
  sub: { color: colors.textMuted, textAlign: 'center', fontSize: 14, lineHeight: 20, marginBottom: 18 },
  feature: { color: 'white', fontWeight: '700' },
  planBox: {
    backgroundColor: 'rgba(94,92,230,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(94,92,230,0.25)',
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  planName: { fontWeight: '700', color: colors.primary },
  planDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10 },
});
