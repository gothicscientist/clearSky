import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, radius, space, useTheme } from '@/theme';

import { Text } from './Text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Spoken label if different from the visible one */
  a11y?: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Segments get `${testID}.${value}` */
  testID: string;
  accessibilityLabel: string;
}

export function Segmented<T extends string>({ options, value, onChange, testID, accessibilityLabel }: SegmentedProps<T>) {
  const { c } = useTheme();
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: c.raised }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`${testID}.${o.value}`}
            accessibilityRole="radio"
            accessibilityLabel={o.a11y ?? o.label}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => {
              if (!selected) haptic('select');
              onChange(o.value);
            }}
            style={[styles.seg, selected && { backgroundColor: c.surface, borderColor: c.line }]}>
            <Text variant="callout" align="center" tone={selected ? 'primary' : 'secondary'} style={styles.label}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.md, gap: 3 },
  seg: {
    flex: 1,
    minHeight: hit.min - 6,
    borderRadius: radius.md - 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  label: { fontWeight: '600' },
});
