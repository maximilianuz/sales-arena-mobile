import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/GlobalStyles';
import { logError } from '../utils/telemetry';

/**
 * Red de seguridad global (móvil). Sin esto, un error de render desmonta todo el
 * árbol y el usuario queda con pantalla en blanco. Con el boundary, aislamos el
 * fallo, mostramos un fallback y lo reportamos a la telemetría (Kaizen).
 * Es class component: los error boundaries no existen como hook en React 19.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] render error:', error, info?.componentStack);
    logError(error, { source: 'error_boundary', componentStack: info?.componentStack?.slice(0, 1000) });
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <View style={styles.badge}><Text style={styles.badgeText}>⚠</Text></View>
        <Text style={styles.title}>Algo se rompió</Text>
        <Text style={styles.body}>Tu sesión está a salvo. Probá reintentar.</Text>
        {this.state.error ? <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>{String(this.state.error?.message || this.state.error)}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={this.handleRetry}>
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bgDark, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  badgeText: { fontSize: 26, color: colors.danger },
  title: { fontSize: 20, fontWeight: '700', color: colors.textMain, marginBottom: 6 },
  body: { color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btn: {
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10,
  },
  btnText: { color: 'white', fontWeight: '600' },
});
