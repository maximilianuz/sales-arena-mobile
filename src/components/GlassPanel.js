import React from 'react';
import { View, StyleSheet } from 'react-native';
import { globalStyles } from '../theme/GlobalStyles';

// For Web/Android fallback, standard Views. For iOS, we could use BlurView from expo-blur
// but to keep it simple and performant across all platforms we'll use a styled View.
export default function GlassPanel({ children, style }) {
  return (
    <View style={[globalStyles.glassPanel, style]}>
      {children}
    </View>
  );
}
