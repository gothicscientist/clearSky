import { Pressable, StyleSheet } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, radius, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Spoken label — required because the button has no visible text. */
  label: string;
  testID: string;
  onPress: () => void;
  /** Filled circular background */
  filled?: boolean;
  disabled?: boolean;
  size?: number;
  color?: string;
}

export function IconButton({ icon, label, testID, onPress, filled, disabled, size = 24, color }: IconButtonProps) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: filled ? c.raised : 'transparent', opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
      ]}>
      <Icon name={icon} size={size} color={color ?? c.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: hit.min,
    height: hit.min,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
