import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function ProductPanel({ productPresentation }) {
  if (!productPresentation) return null;

  // El escenario nuevo (fullScenarioPrompt) guarda productToSell como TEXTO.
  // Mantenemos compatibilidad con el formato objeto viejo por si acaso.
  const isObject = typeof productPresentation === 'object' && productPresentation !== null;

  return (
    <GlassPanel>
      <View style={styles.header}>
        <Package size={16} color={colors.textMain} />
        <Text style={styles.title}>Producto / Servicio a Vender</Text>
      </View>
      {isObject ? (
        <View style={styles.content}>
          {productPresentation.name ? <Text style={styles.name}>{productPresentation.name}</Text> : null}
          {productPresentation.description ? <Text style={styles.desc}>{productPresentation.description}</Text> : null}
          <View style={styles.features}>
            {productPresentation.keyFeatures?.map((feature, idx) => (
              <Text key={idx} style={styles.feature}>• {feature}</Text>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.body}>{productPresentation}</Text>
      )}
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
  body: {
    color: colors.textMain,
    fontSize: 14,
    lineHeight: 21,
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
