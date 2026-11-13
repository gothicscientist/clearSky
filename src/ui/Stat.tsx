import { StyleSheet, View } from 'react-native';

import { space } from '@/theme';

import { Text } from './Text';

export interface StatProps {
  value: string;
  label: string;
  testID?: string;
  /** Large instrument numeral vs. compact title size */
  size?: 'large' | 'compact';
  align?: 'left' | 'center';
}

/** A number with a label underneath. Numerals are tabular so they don't jitter. */
export function Stat({ value, label, testID, size = 'compact', align = 'left' }: StatProps) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.wrap, align === 'center' && styles.center]}>
      <Text
        variant={size === 'large' ? 'numeral' : 'title'}
        tone="horizon"
        maxScale={1.3}
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xxs },
  center: { alignItems: 'center' },
});
