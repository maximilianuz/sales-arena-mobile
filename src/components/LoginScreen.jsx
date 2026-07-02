import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react-native';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';
import { signInWithEmail, registerWithEmail, signInWithGoogle } from '../utils/auth';

// Traducimos errores crudos de Firebase a mensajes claros.
function friendlyError(err, isEn) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return isEn ? 'Wrong email or password.' : 'Email o contraseña incorrectos.';
  }
  if (code.includes('email-already-in-use')) {
    return isEn ? 'That email is already registered. Try signing in.' : 'Ese email ya está registrado. Probá iniciar sesión.';
  }
  if (code.includes('invalid-email')) {
    return isEn ? 'That email is not valid.' : 'Ese email no es válido.';
  }
  if (code.includes('weak-password')) {
    return isEn ? 'Password must be at least 6 characters.' : 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (code.includes('network')) {
    return isEn ? 'Connection error. Check your internet.' : 'Error de conexión. Revisá tu internet.';
  }
  return err?.message || (isEn ? 'Something went wrong. Try again.' : 'Algo salió mal. Probá de nuevo.');
}

export default function LoginScreen() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').toLowerCase().startsWith('en');

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = isEn
    ? {
        subtitle: 'AI-Powered Sales Simulator',
        signIn: 'Sign in', signUp: 'Create account',
        emailPh: 'Email', passPh: 'Password (min. 6)',
        toggleToSignup: "Don't have an account? Sign up",
        toggleToLogin: 'Already have an account? Sign in',
        google: 'Continue with Google',
        or: 'or',
      }
    : {
        subtitle: 'Simulador de Ventas con IA',
        signIn: 'Iniciar sesión', signUp: 'Crear cuenta',
        emailPh: 'Email', passPh: 'Contraseña (mín. 6)',
        toggleToSignup: '¿No tenés cuenta? Registrate',
        toggleToLogin: '¿Ya tenés cuenta? Iniciá sesión',
        google: 'Continuar con Google',
        or: 'o',
      };

  const handleSubmit = async () => {
    if (!email || !password || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') await registerWithEmail(email.trim(), password);
      else await signInWithEmail(email.trim(), password);
      // El cambio de estado de auth (onAuthStateChanged) actualiza el gate solo.
    } catch (err) {
      setError(friendlyError(err, isEn));
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError(err, isEn));
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <GlassPanel style={styles.panel}>
          <Text style={styles.title}>Sales Arena</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          <View style={styles.inputWrap}>
            <Mail size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t.emailPh}
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Lock size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t.passPh}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnPrimary, styles.submit]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="white" size="small" />
              : <Text style={globalStyles.btnText}>{mode === 'signup' ? t.signUp : t.signIn}</Text>}
          </TouchableOpacity>

          {Platform.OS === 'web' && (
            <>
              <Text style={styles.or}>{t.or}</Text>
              <TouchableOpacity
                style={[globalStyles.btn, globalStyles.btnOutline]}
                onPress={handleGoogle}
              >
                <Text style={[globalStyles.btnText, { color: colors.textMain }]}>{t.google}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' ? t.toggleToSignup : t.toggleToLogin}
            </Text>
          </TouchableOpacity>
        </GlassPanel>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  panel: { gap: 4 },
  title: { fontSize: 30, fontWeight: 'bold', color: colors.textMain, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  input: { flex: 1, color: colors.textMain, paddingVertical: 14, fontSize: 15 },
  error: { color: colors.danger, fontSize: 13, marginTop: 12, textAlign: 'center' },
  submit: { marginTop: 18 },
  or: { color: colors.textMuted, textAlign: 'center', marginVertical: 12, fontSize: 13 },
  toggle: { marginTop: 18, alignItems: 'center' },
  toggleText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
