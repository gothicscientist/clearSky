import { Platform } from 'react-native';

import type { Flight } from '@/types';

import { clock } from './clock';

/**
 * Local, on-device reminders only — clearSky has no push server and never
 * registers for remote notifications. Everything here is a safe no-op on web
 * and wherever the notifications module is unavailable.
 */

type Notifications = typeof import('expo-notifications');

let mod: Notifications | null | undefined;

function load(): Notifications | null {
  if (mod !== undefined) return mod;
  if (Platform.OS === 'web') {
    mod = null;
    return mod;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('expo-notifications') as Notifications;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    mod = null;
  }
  return mod;
}

export type ReminderPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export const reminders = {
  async permission(): Promise<ReminderPermission> {
    const N = load();
    if (!N) return 'unsupported';
    try {
      const res = await N.getPermissionsAsync();
      if (res.granted) return 'granted';
      return res.canAskAgain ? 'undetermined' : 'denied';
    } catch {
      return 'unsupported';
    }
  },

  /** Shows the system prompt (only call after the in-app priming screen). */
  async request(): Promise<ReminderPermission> {
    const N = load();
    if (!N) return 'unsupported';
    try {
      const res = await N.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: false, allowBadge: false },
      });
      return res.granted ? 'granted' : 'denied';
    } catch {
      return 'unsupported';
    }
  },

  /**
   * (Re)schedule the gentle pre-flight reminders for a flight: the evening before
   * and three hours before departure. Past times are skipped. Idempotent per flight.
   */
  async scheduleForFlight(flight: Flight): Promise<void> {
    const N = load();
    if (!N) return;
    try {
      await reminders.cancelForFlight(flight.id);
      if ((await reminders.permission()) !== 'granted') return;
      // departAt is the true instant (departLocal is origin wall-clock time, not device time).
      const depart = flight.departAt;
      if (!Number.isFinite(depart)) return;
      const now = clock.now();
      const plan: { key: string; at: number; title: string; body: string }[] = [
        {
          key: 'eve',
          at: depart - 18 * 60 * 60 * 1000,
          title: `Flying to ${flight.to.city} tomorrow`,
          body: 'Five quiet minutes now makes tomorrow easier. Your plan is ready.',
        },
        {
          key: 'pre',
          at: depart - 3 * 60 * 60 * 1000,
          title: 'Three hours to go',
          body: 'Open clearSky when you reach the gate. Everything works offline.',
        },
      ];
      for (const p of plan) {
        if (p.at <= now + 60_000) continue;
        await N.scheduleNotificationAsync({
          identifier: `flight.${flight.id}.${p.key}`,
          content: { title: p.title, body: p.body, sound: false },
          trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(p.at) },
        });
      }
    } catch {
      // Reminders are a nicety; never fail a flight save because of them.
    }
  },

  async cancelForFlight(flightId: string): Promise<void> {
    const N = load();
    if (!N) return;
    try {
      await Promise.all(
        ['eve', 'pre'].map((k) =>
          N.cancelScheduledNotificationAsync(`flight.${flightId}.${k}`).catch(() => {}),
        ),
      );
    } catch {
      // ignore
    }
  },

  async cancelAll(): Promise<void> {
    const N = load();
    if (!N) return;
    try {
      await N.cancelAllScheduledNotificationsAsync();
    } catch {
      // ignore
    }
  },
};
