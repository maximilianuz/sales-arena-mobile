import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '../src/i18n'; // Initialize i18n
import { colors } from '../src/theme/GlobalStyles';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bgDark,
          },
          headerTintColor: colors.textMain,
          contentStyle: {
            backgroundColor: colors.bgDark,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
