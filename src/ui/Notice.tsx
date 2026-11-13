import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface NoticeProps {
  /** `info` neutral, `calm` reassuring, `attention` needs a look (never "danger") */
  tone?: 'info' | 'calm' | 'attention';
  title?: string;
  children?: ReactNode;
  icon?: IconName;
  testID?: string;
  /** Inline action (e.g. a compact Button) */
  action?: ReactNode;
}

/** Inline message: offline state, store problems, limits statements. */
export function Notice({ tone = 'info', title, children, icon, testID, action }: NoticeProps) {
  const { c } = useTheme();
  const accent = tone === 'calm' ? c.calm : tone === 'attention' ? c.ember : c.textSecondary;
  const glyph: IconName = icon ?? (tone === 'calm' ? 'check' : 'info');
  return (
    <View
      testID={testID}
      accessibilityRole={tone === 'attention' ? 'alert' : 'summary'}
      style={[styles.box, { backgroundColor: c.surface, borderColor: c.line, borderLeftColor: accent }]}>
      <Icon name={glyph} size={20} color={accent} />
      <View style={styles.body}>
        {title ? <Text variant="bodyStrong">{title}</Text> : null}
        {typeof children === 'string' ? (
          <Text variant="callout" tone="secondary">
            {children}
          </Text>
        ) : (
          children
        )}
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
  },
  body: { flex: 1, gap: space.xs },
  action: { marginTop: space.sm, alignItems: 'flex-start' },
});
