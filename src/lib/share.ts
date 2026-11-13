import * as Sharing from 'expo-sharing';
import type { ComponentRef, RefObject } from 'react';
import { Platform, type View } from 'react-native';

export type ShareResult = 'shared' | 'unavailable' | 'failed';

/** Recorded for e2e assertions (the system share sheet can't be driven on web). */
export const shareLog: { name: string; result: ShareResult }[] = [];

/**
 * Render a view to a PNG entirely on-device and hand it to the system share sheet.
 * Works offline. On web (used only for tests) there is no share sheet, so this
 * reports 'unavailable' and the UI shows its "saving isn't available here" state.
 */
export async function shareView(
  ref: RefObject<ComponentRef<typeof View> | null>,
  name: string,
  options: { width?: number; height?: number } = {},
): Promise<ShareResult> {
  const done = (result: ShareResult) => {
    shareLog.push({ name, result });
    return result;
  };
  if (Platform.OS === 'web') return done('unavailable');
  try {
    // Lazy so the web bundle never evaluates the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { captureRef } = require('react-native-view-shot') as typeof import('react-native-view-shot');
    if (!ref.current) return done('failed');
    const uri = await captureRef(ref.current as unknown as Parameters<typeof captureRef>[0], {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      fileName: name,
      ...(options.width ? { width: options.width } : {}),
      ...(options.height ? { height: options.height } : {}),
    });
    if (!(await Sharing.isAvailableAsync())) return done('unavailable');
    await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: name });
    return done('shared');
  } catch {
    return done('failed');
  }
}
