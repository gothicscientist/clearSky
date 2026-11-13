import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { radius, space, useTheme } from '@/theme';

import { Text } from './Text';

export interface FearScaleProps {
  value: number | null;
  onChange: (v: number) => void;
  /** testID prefix: buttons are `${testID}.0` … `${testID}.10` */
  testID: string;
  /** Visible question above the scale */
  label?: string;
  lowLabel?: string;
  highLabel?: string;
}

/**
 * 0–10 self-rating used for expected/actual fear. Eleven equal buttons rather
 * than a slider: easier with shaking hands, works with VoiceOver, no drag.
 */
export function FearScale({
  value,
  onChange,
  testID,
  label,
  lowLabel = 'Calm',
  highLabel = 'Very anxious',
}: FearScaleProps) {
  const { c } = useTheme();
  return (
    <View style={styles.wrap} testID={testID}>
      {label ? <Text variant="heading">{label}</Text> : null}
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label ?? 'Rate from 0 to 10'}>
        {Array.from({ length: 11 }, (_, n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              testID={`${testID}.${n}`}
              accessibilityRole="radio"
              accessibilityLabel={`${n}${n === 0 ? `, ${lowLabel}` : n === 10 ? `, ${highLabel}` : ''}`}
              accessibilityState={{ selected, checked: selected }}
              hitSlop={{ top: 8, bottom: 8 }}
              onPress={() => {
                haptic('select');
                onChange(n);
              }}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: selected ? c.horizon : c.raised,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text
                variant="bodyStrong"
                align="center"
                maxScale={1.2}
                style={{ color: selected ? c.onHorizon : c.text, fontVariant: ['tabular-nums'] }}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text variant="caption" tone="secondary">
          {lowLabel}
        </Text>
        <Text variant="caption" tone="secondary">
          {highLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: 4 },
  cell: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
});
