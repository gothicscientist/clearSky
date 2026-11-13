import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useProfileStore } from '@/stores/profile';

/**
 * Haptics service. Respects the user's setting, is a silent no-op on web and
 * never throws. clearSky never uses the "error" notification buzz.
 */

export type HapticEvent = 'tap' | 'select' | 'soft' | 'firm' | 'success';

/** Recorded in tests so flows can assert that a haptic *would* have fired. */
export const hapticLog: { event: HapticEvent; at: number }[] = [];

function enabled(): boolean {
  return useProfileStore.getState().settings.haptics;
}

export function haptic(event: HapticEvent): void {
  if (!enabled()) return;
  if (hapticLog.length > 200) hapticLog.splice(0, 100);
  hapticLog.push({ event, at: Date.now() });
  if (Platform.OS === 'web') return;
  try {
    switch (event) {
      case 'tap':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case 'select':
        void Haptics.selectionAsync().catch(() => {});
        break;
      case 'soft':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
        break;
      case 'firm':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case 'success':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
    }
  } catch {
    // Haptics unavailable on this device.
  }
}
