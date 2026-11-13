import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { routes } from '@/lib/routes';
import { hit, radius, space, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Floating SOS button shown above the tab bar on every tab screen. One tap,
 * no confirmation, opens the full-screen calming sequence.
 */
export function SOSButton({ bottom }: { bottom: number }) {
  const { c } = useTheme();
  return (
    <View pointerEvents="box-none" style={[styles.anchor, { bottom }]}>
      <Pressable
        testID="app.sos-button"
        accessibilityRole="button"
        accessibilityLabel="SOS"
        accessibilityHint="Opens calming help straight away"
        hitSlop={8}
        onPress={() => {
          haptic('soft');
          router.push(routes.sos);
        }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: c.calm, shadowColor: '#000', opacity: pressed ? 0.85 : 1 },
        ]}>
        <Icon name="breathe" size={22} color={c.onCalm} strokeWidth={2} />
        <Text variant="bodyStrong" tone="onCalm" maxScale={1.3}>
          SOS
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', right: space.lg },
  button: {
    minHeight: hit.sos,
    minWidth: hit.sos + 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
