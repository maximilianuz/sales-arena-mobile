import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/GlobalStyles';

// Banner de resultado del checkout, visible para todos los roles.
export default function CheckoutResultBanner({ checkout }) {
  if (!checkout?.result) return null;
  const closed = checkout.result === 'closed';

  return (
    <View style={[
      styles.banner,
      {
        borderColor: closed ? colors.success : colors.danger,
        backgroundColor: closed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      },
    ]}>
      <Text style={styles.emoji}>{closed ? '🎉' : '😔'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: closed ? colors.success : colors.danger }]}>
          {closed ? 'TRATO CERRADO' : 'TRATO PERDIDO'}
        </Text>
        <Text style={styles.sub}>Resultado del checkout — hacé el debrief ahora</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  emoji: { fontSize: 28 },
  title: { fontWeight: '800', fontSize: 16 },
  sub: { color: colors.textMuted, fontSize: 12 },
});
