import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAccess } from '@/lib/access';
import { usePurchasesLifecycle } from '@/lib/purchases';
import { useStoresHydrated } from '@/stores/persist';
import { useAppFonts } from '@/theme/fonts';
import { useTheme } from '@/theme';
// Register every foundation store at startup so hydration is tracked as one unit.
import '@/stores/entitlement';
import '@/stores/flights';
import '@/stores/profile';
import '@/stores/progress';

if (process.env.EXPO_PUBLIC_E2E === '1') {
  // Compiled out of normal builds (constant-folded before bundling); `npm run check:bundle` verifies.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@/lib/testBridge').installTestBridge();
}

void SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = { anchor: 'index' };

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const hydrated = useStoresHydrated();
  // Latch: once the app has rendered, never tear the navigator down again
  // (a feature store created later must not blank the whole app while it loads).
  const [ready, setReady] = useState(false);
  if (!ready && fontsReady && hydrated) setReady(true);

  usePurchasesLifecycle();
  const theme = useTheme();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const navTheme = useMemo(() => {
    const base = theme.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.c.horizon,
        background: theme.c.bg,
        card: theme.c.surface,
        text: theme.c.text,
        border: theme.c.line,
        notification: theme.c.ember,
      },
    };
  }, [theme]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.c.bg }]}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        {ready ? <RootStack bg={theme.c.bg} /> : <View testID="app.loading" style={styles.root} />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootStack({ bg }: { bg: string }) {
  const { onboarded, pro } = useAccess();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg }, animation: 'fade' }}>
      <Stack.Screen name="index" />

      {/* Onboarding stays reachable until purchase so Back from the paywall returns to the plan. */}
      <Stack.Protected guard={!pro || !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      {/* Hard paywall: the only thing reachable after onboarding until there's an entitlement. */}
      <Stack.Protected guard={!pro}>
        <Stack.Screen name="paywall" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>

      <Stack.Protected guard={pro && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="sos"
          options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="journey" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
      </Stack.Protected>

      {/* Terms, privacy and licences must be readable from the paywall, before purchase. */}
      <Stack.Screen name="legal" options={{ animation: 'slide_from_bottom' }} />
      {/* Safety information is never paywalled. */}
      <Stack.Screen name="crisis" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
