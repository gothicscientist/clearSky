import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/lib/haptics';
import { layout, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { SOSButton } from './SOSButton';
import { Text } from './Text';

const ICONS: Record<string, IconName> = { today: 'today', calm: 'calm', fly: 'fly', learn: 'learn' };
const LABELS: Record<string, string> = { today: 'Today', calm: 'Calm', fly: 'Fly', learn: 'Learn' };

export const TAB_BAR_HEIGHT = 58;

/** Quiet four-tab bar with the floating SOS button riding just above it. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, space.sm);

  return (
    <View
      style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: bottomPad }]}
      accessibilityRole="tablist">
      <SOSButton bottom={TAB_BAR_HEIGHT + bottomPad + space.md} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const name = route.name;
          const label = LABELS[name] ?? name;
          const color = focused ? c.horizon : c.textSecondary;
          return (
            <Pressable
              key={route.key}
              testID={`app.tab.${name}`}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptic('select');
                  navigateToTab(route.key);
                }
              }}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}>
              <Icon name={ICONS[name] ?? 'dot'} size={24} color={color} strokeWidth={focused ? 2 : 1.6} />
              <Text variant="caption" maxScale={1.2} style={{ color, fontWeight: focused ? '600' : '400' }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
