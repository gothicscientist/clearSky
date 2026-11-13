import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { hit, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Right-hand value text (e.g. "On", "12 min") */
  value?: string;
  /** Custom right-hand element (replaces value + chevron) */
  right?: ReactNode;
  onPress?: () => void;
  testID: string;
  accessibilityHint?: string;
  /** Opens outside the app (shows the external glyph) */
  external?: boolean;
  /** Draw a hairline above (for grouped lists) */
  divider?: boolean;
  destructive?: boolean;
}

/** Settings-style row. Whole row is the touch target. */
export function ListRow({
  title,
  subtitle,
  icon,
  value,
  right,
  onPress,
  testID,
  accessibilityHint,
  external,
  divider,
  destructive,
}: ListRowProps) {
  const { c } = useTheme();
  const content = (
    <>
      {icon ? <Icon name={icon} size={22} color={destructive ? c.ember : c.textSecondary} /> : null}
      <View style={styles.labels}>
        <Text variant="body" tone={destructive ? 'ember' : 'primary'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (
        <>
          {value ? (
            <Text variant="callout" tone="secondary">
              {value}
            </Text>
          ) : null}
          {onPress ? <Icon name={external ? 'external' : 'chevron'} size={18} color={c.textTertiary} /> : null}
        </>
      )}
    </>
  );
  const rowStyle = [styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line }];
  if (!onPress) {
    return (
      <View testID={testID} style={rowStyle} accessible accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [...rowStyle, { opacity: pressed ? 0.7 : 1 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: hit.min + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  labels: { flex: 1, gap: space.xxs },
});
