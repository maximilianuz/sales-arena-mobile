import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function ProductPanel({ productPresentation }) {
  if (!productPresentation) return null;

  return (
    <GlassPanel>
      <View style={styles.header}>
        <Package size={16} color={colors.textMain} />
        <Text style={styles.title}>Producto a Vender</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{productPresentation.name}</Text>
        <Text style={styles.desc}>{productPresentation.description}</Text>
        <View style={styles.features}>
          {productPresentation.keyFeatures?.map((feature, idx) => (
            <Text key={idx} style={styles.feature}>• {feature}</Text>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    color: colors.textMuted,
    marginBottom: 12,
  },
  features: {
    gap: 4,
  },
  feature: {
    color: 'white',
    fontSize: 13,
  }
});
