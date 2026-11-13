import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, space, useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export interface ScreenProps {
  children: ReactNode;
  /** Required: `<feature>.<screen>` — e2e tests wait for this id to know the screen is showing. */
  testID: string;
  /** Large title rendered at the top of the content */
  title?: string;
  /** Small uppercase line above the title */
  eyebrow?: string;
  /** Show a back chevron (stack screens). Pass a function to override the default `router.back()`. */
  back?: boolean | (() => void);
  /** Show a close (×) button instead of back — for modals. */
  close?: boolean | (() => void);
  /** Element on the right of the header row (e.g. settings gear) */
  headerRight?: ReactNode;
  /** Scroll the content (default true). Set false for full-bleed instruments. */
  scroll?: boolean;
  /** Pinned below the content, above the safe area (primary CTA) */
  footer?: ReactNode;
  /** Extra bottom padding so content clears the tab bar + SOS button (tab root screens) */
  tabRoot?: boolean;
  /** Remove horizontal gutters (for edge-to-edge content) */
  bleed?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Standard page chrome: safe areas, background, header row, optional pinned footer. */
export function Screen({
  children,
  testID,
  title,
  eyebrow,
  back,
  close,
  headerRight,
  scroll = true,
  footer,
  tabRoot,
  bleed,
  contentStyle,
}: ScreenProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (typeof back === 'function') return back();
    if (typeof close === 'function') return close();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const hasHeaderRow = !!back || !!close || !!headerRight;
  const bottomPad = (tabRoot ? 132 : space.xl) + (footer ? 0 : insets.bottom);

  const header = (
    <>
      {hasHeaderRow ? (
        <View style={styles.headerRow}>
          {back ? (
            <IconButton icon="back" label="Back" testID={`${testID}.back`} onPress={goBack} />
          ) : close ? (
            <IconButton icon="close" label="Close" testID={`${testID}.close`} onPress={goBack} />
          ) : (
            <View />
          )}
          {headerRight ?? <View />}
        </View>
      ) : null}
      {eyebrow ? (
        <Text variant="label" tone="horizon" style={styles.eyebrow}>
          {eyebrow}
        </Text>
      ) : null}
      {title ? (
        <Text variant="display" style={styles.title}>
          {title}
        </Text>
      ) : null}
    </>
  );

  const inner = (
    <View style={[styles.inner, bleed ? null : styles.gutter, contentStyle]}>
      {header}
      {children}
    </View>
  );

  return (
    <View
      testID={testID}
      style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + (hasHeaderRow ? space.xs : space.lg) }]}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        <View style={[styles.flex, { paddingBottom: footer ? 0 : bottomPad }]}>{inner}</View>
      )}
      {footer ? (
        <View
          style={[
            styles.footer,
            styles.gutter,
            { paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: c.bg, borderTopColor: c.line },
          ]}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
  gutter: { paddingHorizontal: layout.gutter },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginLeft: -space.sm,
    marginRight: -space.sm,
    marginBottom: space.sm,
  },
  eyebrow: { marginBottom: space.xs },
  title: { marginBottom: space.lg },
  footer: { paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  footerInner: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: space.sm },
});
