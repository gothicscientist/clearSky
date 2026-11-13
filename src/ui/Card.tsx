import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { radius, space, useTheme } from '@/theme';

export interface CardProps {
  children: ReactNode;
  testID?: string;
  /** Makes the whole card a button */
  onPress?: () => void;
  /** Required with onPress: what VoiceOver reads for the card */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** `raised` for nested emphasis, `outline` for quiet containers */
  tone?: 'surface' | 'raised' | 'outline';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The standard container. Cards never carry meaning through colour alone. */
export function Card({
  children,
  testID,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  tone = 'surface',
  padded = true,
  style,
}: CardProps) {
  const { c } = useTheme();
  const base = [
    styles.base,
    padded && styles.padded,
    {
      backgroundColor: tone === 'outline' ? 'transparent' : tone === 'raised' ? c.raised : c.surface,
      borderColor: c.line,
      borderWidth: tone === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
    },
    style,
  ];
  if (!onPress) {
    return (
      <View testID={testID} style={base}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [...base, { opacity: pressed ? 0.85 : 1 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, overflow: 'hidden' },
  padded: { padding: space.lg },
});
