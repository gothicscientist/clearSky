import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { getSource, type Source } from '@/content/sources';
import { space, useTheme } from '@/theme';

import { Text } from './Text';

export interface SourceNoteProps {
  /** Source ids from src/content/sources */
  ids: string[];
  testID?: string;
  /** Heading above the list (default "Sources") */
  title?: string;
}

/**
 * Citation footer. Every factual claim in clearSky carries one. Links open in an
 * in-app browser when online; the citation text itself is always readable offline.
 */
export function SourceNote({ ids, testID, title = 'Sources' }: SourceNoteProps) {
  const { c } = useTheme();
  const list = ids.map(getSource).filter((s): s is Source => s != null);
  if (list.length === 0) return null;
  return (
    <View testID={testID} style={[styles.wrap, { borderTopColor: c.line }]}>
      <Text variant="label" tone="secondary">
        {title}
      </Text>
      {list.map((s) => (
        <Pressable
          key={s.id}
          testID={testID ? `${testID}.${s.id}` : undefined}
          accessibilityRole={s.url ? 'link' : 'text'}
          accessibilityLabel={`${s.title}, ${s.publisher}`}
          disabled={!s.url}
          onPress={() => {
            if (s.url) void WebBrowser.openBrowserAsync(s.url).catch(() => {});
          }}>
          <Text variant="caption" tone="secondary">
            {s.publisher} — {s.title}
            {s.locator ? `, ${s.locator}` : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, paddingTop: space.lg, marginTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
