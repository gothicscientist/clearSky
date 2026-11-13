import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ChoiceProps {
  label: string;
  /** Optional second line */
  detail?: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
  /** `multi` draws a checkbox, `single` a radio */
  mode?: 'single' | 'multi';
  icon?: IconName;
  disabled?: boolean;
}

/** A large, tappable answer row for questionnaires and pickers. */
export function Choice({ label, detail, selected, onPress, testID, mode = 'single', icon, disabled }: ChoiceProps) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole={mode === 'multi' ? 'checkbox' : 'radio'}
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      accessibilityState={{ checked: selected, selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? c.raised : c.surface,
          borderColor: selected ? c.horizon : c.line,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      {icon ? <Icon name={icon} size={22} color={selected ? c.horizon : c.textSecondary} /> : null}
      <View style={styles.labels}>
        <Text variant="bodyStrong">{label}</Text>
        {detail ? (
          <Text variant="callout" tone="secondary">
            {detail}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          mode === 'multi' ? styles.box : styles.radio,
          { borderColor: selected ? c.horizon : c.textTertiary, backgroundColor: selected ? c.horizon : 'transparent' },
        ]}>
        {selected ? <Icon name="check" size={16} color={c.onHorizon} strokeWidth={2.4} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: hit.sos,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  labels: { flex: 1, gap: space.xxs },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
