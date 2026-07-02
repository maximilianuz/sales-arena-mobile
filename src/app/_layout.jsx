import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import '../i18n'; // Initialize i18n
import { colors } from '../theme/GlobalStyles';
import { subscribeToAuthState } from '../utils/auth';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import LoginScreen from '../components/LoginScreen';
import ErrorBoundary from '../components/ErrorBoundary';
import { logError } from '../utils/telemetry';

// Captura global de errores no atrapados (última línea de defensa del observador
// Kaizen). ErrorUtils es la API de RN para el handler global de JS.
if (typeof global !== 'undefined' && global.ErrorUtils && !global.__salesArenaErrHooked) {
  global.__salesArenaErrHooked = true;
  const prev = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    logError(error, { source: 'global', isFatal: !!isFatal });
    if (typeof prev === 'function') prev(error, isFatal);
  });
}

export default function RootLayout() {
  // undefined = cargando sesión, null = sin sesión, objeto = logueado.
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setUser);
    return () => unsubscribe();
  }, []);

  const screenOptions = {
    headerStyle: { backgroundColor: colors.bgDark },
    headerTintColor: colors.textMain,
    contentStyle: { backgroundColor: colors.bgDark },
  };

  let content;
  if (user === undefined) {
    content = (
      <View style={{ flex: 1, backgroundColor: colors.bgDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  } else if (!user) {
    content = <LoginScreen />;
  } else {
    // Autenticado: proveemos el contexto de suscripción (mismo plan que la web)
    // y montamos el navegador.
    content = (
      <SubscriptionProvider user={user}>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
        </Stack>
      </SubscriptionProvider>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      {content}
    </ErrorBoundary>
  );
}
