import { StyleSheet, Switch, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, space, useTheme } from '@/theme';

import { Text } from './Text';

export interface ToggleRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID: string;
  disabled?: boolean;
  divider?: boolean;
}

export function ToggleRow({ title, subtitle, value, onChange, testID, disabled, divider }: ToggleRowProps) {
  const { c } = useTheme();
  return (
    <View
      style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line }]}>
      <View style={styles.labels}>
        <Text variant="body">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        testID={testID}
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        value={value}
        disabled={disabled}
        onValueChange={(v) => {
          haptic('select');
          onChange(v);
        }}
        trackColor={{ false: c.raised, true: c.calm }}
        thumbColor={c.text}
        ios_backgroundColor={c.raised}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: hit.min + 8, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  labels: { flex: 1, gap: space.xxs },
});
