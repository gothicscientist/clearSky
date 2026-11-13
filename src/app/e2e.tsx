import { Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

interface Bridge {
  seed: (name: string) => Promise<void>;
  net: { setOffline: (v: boolean) => void };
}

/**
 * Deep-link entry for native e2e (Maestro): `clearsky://e2e?seed=pro&path=/today&offline=1`.
 * Only does anything in builds compiled with EXPO_PUBLIC_E2E=1 (where the test bridge exists);
 * everywhere else it simply redirects home.
 */
export default function E2EEntry() {
  const { seed, path, offline } = useLocalSearchParams<{ seed?: string; path?: string; offline?: string }>();
  const bridge = (globalThis as unknown as { __CS__?: Bridge }).__CS__;

  useEffect(() => {
    if (!bridge) return;
    let alive = true;
    void (async () => {
      if (seed) await bridge.seed(seed);
      if (offline === '1') bridge.net.setOffline(true);
      if (alive) router.replace((path || '/') as Href);
    })();
    return () => {
      alive = false;
    };
  }, [bridge, seed, path, offline]);

  if (!bridge) return <Redirect href="/" />;
  return <View testID="e2e.entry" style={{ flex: 1 }} />;
}
