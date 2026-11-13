import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'calm' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** Required: stable id for e2e tests, `<feature>.<screen>.<element>` in kebab-case. */
  testID: string;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  /** Shows a spinner and blocks presses; the label stays for screen readers. */
  loading?: boolean;
  /** Smaller, inline-sized button */
  compact?: boolean;
  /** Second line under the label (e.g. price detail) */
  sublabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  testID,
  variant = 'primary',
  icon,
  disabled,
  loading,
  compact,
  sublabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { c } = useTheme();
  const inactive = disabled || loading;

  const bg =
    variant === 'primary'
      ? c.horizon
      : variant === 'calm'
        ? c.calm
        : variant === 'secondary'
          ? c.raised
          : 'transparent';
  const fg =
    variant === 'primary' ? c.onHorizon : variant === 'calm' ? c.onCalm : c.text;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        {
          backgroundColor: bg,
          borderColor: variant === 'ghost' ? c.line : 'transparent',
          borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: inactive ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={fg} /> : null}
          <View style={styles.labels}>
            <Text variant="bodyStrong" style={{ color: fg }} align="center">
              {label}
            </Text>
            {sublabel ? (
              <Text variant="caption" style={{ color: fg, opacity: 0.85 }} align="center">
                {sublabel}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regular: { minHeight: 56, paddingHorizontal: space.xl, paddingVertical: space.md },
  compact: { minHeight: hit.min, paddingHorizontal: space.lg, paddingVertical: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  labels: { flexShrink: 1 },
});
