import AsyncStorage from '@react-native-async-storage/async-storage';

import { analyticsLog } from '@/lib/analytics';
import { clock } from '@/lib/clock';
import { hapticLog } from '@/lib/haptics';
import { motion } from '@/lib/motion';
import { narratorLog } from '@/lib/narrator';
import { net } from '@/lib/net';
import { mockControl, purchases } from '@/lib/purchases';
import { shareLog } from '@/lib/share';
import { epochToZonedLocal, zonedLocalToEpoch } from '@/lib/time';
import { useEntitlementStore } from '@/stores/entitlement';
import { useFlightsStore } from '@/stores/flights';
import { resetAllStores, whenStoresHydrated } from '@/stores/persist';
import { useProfileStore } from '@/stores/profile';
import { useProgressStore } from '@/stores/progress';
import type { Airport, Flight } from '@/types';

/**
 * End-to-end test bridge, exposed as `globalThis.__CS__`.
 *
 * Installed ONLY when the bundle is built with EXPO_PUBLIC_E2E=1 (the call site
 * in src/app/_layout.tsx is guarded by that constant so the bridge is dead code
 * in production builds; `npm run check:bundle` greps the export to prove it).
 */

export type SeedName = 'fresh' | 'onboarded' | 'pro' | 'proWithFlight' | 'midflight' | 'landed';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const JFK: Airport = {
  iata: 'JFK',
  icao: 'KJFK',
  name: 'John F. Kennedy International Airport',
  city: 'New York',
  country: 'US',
  lat: 40.6394,
  lon: -73.7793,
  tz: 'America/New_York',
};
const LAX: Airport = {
  iata: 'LAX',
  icao: 'KLAX',
  name: 'Los Angeles International Airport',
  city: 'Los Angeles',
  country: 'US',
  lat: 33.9425,
  lon: -118.408,
  tz: 'America/Los_Angeles',
};

const localStamp = (epoch: number) => epochToZonedLocal(epoch, JFK.tz);

function sampleFlight(patch: Partial<Flight>): Flight {
  const now = clock.now();
  const flight: Flight = {
    id: 'seed-flight',
    quick: false,
    from: JFK,
    to: LAX,
    departLocal: localStamp(now + 2 * 24 * 60 * 60 * 1000),
    departAt: 0,
    durationMin: 360,
    distanceKm: 3974,
    expectedFear: 8,
    status: 'upcoming',
    session: null,
    debrief: null,
    createdAt: now,
    ...patch,
  };
  return { ...flight, departAt: zonedLocalToEpoch(flight.departLocal, flight.from.tz) };
}

// Airplane mode and clock jumps must survive a simulated app kill (page reload),
// so the bridge mirrors them into sessionStorage and re-applies them on install.
const KEY_OFFLINE = '__cs_offline';
const KEY_CLOCK = '__cs_clock';

function session(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

function remember(key: string, value: string | null): void {
  try {
    if (value == null) session()?.removeItem(key);
    else session()?.setItem(key, value);
  } catch {
    // ignore
  }
}

function setOffline(v: boolean): void {
  net.setForcedOffline(v);
  remember(KEY_OFFLINE, v ? '1' : null);
}

function advanceClock(ms: number): void {
  clock.advance(ms);
  remember(KEY_CLOCK, String(clock.offset()));
}

async function seed(name: SeedName): Promise<void> {
  await whenStoresHydrated();
  await resetAllStores();
  await purchases.dev.clearAccount();
  mockControl.reset();
  mockControl.latencyMs = 60;
  setOffline(false);
  clock.reset();
  remember(KEY_CLOCK, null);
  if (name === 'fresh') return;

  useProfileStore.setState({
    answers: {
      fears: ['turbulence', 'takeoffLanding'],
      primaryFear: 'turbulence',
      peaks: ['cruiseBumps'],
      body: ['racingHeart', 'tightChest'],
      nextFlight: 'booked',
      nextFlightDate: localStamp(clock.now() + 2 * 24 * 60 * 60 * 1000).slice(0, 10),
      tried: ['whiteKnuckling'],
      demoCheckIn: 'aLittle',
      goal: 'boardCalmly',
    },
    onboardingStep: 99,
    onboardingCompletedAt: clock.now(),
  });
  if (name === 'onboarded') return;

  // Subscribed: both the mock store account and the cached entitlement.
  mockControl.nextRestore = 'restored';
  await purchases.restore();
  useEntitlementStore.getState().apply({
    active: true,
    productId: 'yearly',
    expiresAt: clock.now() + YEAR_MS,
  });
  if (name === 'pro') return;

  const now = clock.now();
  if (name === 'proWithFlight') {
    useFlightsStore.setState({ flights: [sampleFlight({})] });
  } else if (name === 'midflight') {
    useFlightsStore.setState({
      flights: [
        sampleFlight({
          departLocal: localStamp(now - 60 * 60 * 1000),
          status: 'inFlight',
          session: {
            startedAt: now - 60 * 60 * 1000,
            takeoffAt: now - 45 * 60 * 1000,
            durationMin: 360,
            offsetMs: 0,
            endedAt: null,
          },
        }),
      ],
    });
  } else if (name === 'landed') {
    useFlightsStore.setState({
      flights: [
        sampleFlight({
          departLocal: localStamp(now - 8 * 60 * 60 * 1000),
          status: 'landed',
          session: {
            startedAt: now - 8 * 60 * 60 * 1000,
            takeoffAt: now - 8 * 60 * 60 * 1000 + 15 * 60 * 1000,
            durationMin: 360,
            offsetMs: 0,
            endedAt: now - 2 * 60 * 60 * 1000,
          },
        }),
      ],
    });
  }
}

export function installTestBridge(): void {
  // Re-apply simulated airplane mode / clock jumps from before a relaunch.
  if (session()?.getItem(KEY_OFFLINE) === '1') net.setForcedOffline(true);
  const savedOffset = Number(session()?.getItem(KEY_CLOCK) ?? 0);
  if (Number.isFinite(savedOffset) && savedOffset !== 0) clock.advance(savedOffset);

  const bridge = {
    ready: () => whenStoresHydrated().then(() => true),
    reset: () => seed('fresh'),
    seed,
    state: () => ({
      profile: useProfileStore.getState(),
      entitlement: useEntitlementStore.getState(),
      flights: useFlightsStore.getState().flights,
      progress: useProgressStore.getState(),
    }),
    /** Raw persisted payload for a store key, to assert what survives a reload. */
    stored: (name: string) => AsyncStorage.getItem(`clearsky.${name}`),
    /** Overwrite a persisted payload (to test corruption recovery), then reload the page. */
    corrupt: (name: string, raw = '{not json') => AsyncStorage.setItem(`clearsky.${name}`, raw),
    purchases: {
      setNext: (v: typeof mockControl.nextPurchase) => {
        mockControl.nextPurchase = v;
      },
      setRestore: (v: typeof mockControl.nextRestore) => {
        mockControl.nextRestore = v;
      },
      setOfferings: (v: typeof mockControl.offerings) => {
        mockControl.offerings = v;
      },
      setLatency: (ms: number) => {
        mockControl.latencyMs = ms;
      },
      expire: () => purchases.dev.expireNow(),
      refresh: () => purchases.refresh(),
    },
    clock: {
      now: () => clock.now(),
      advance: (ms: number) => advanceClock(ms),
    },
    net: {
      setOffline: (v: boolean) => setOffline(v),
      isOffline: () => net.isForcedOffline(),
    },
    motion: {
      push: (samples: { x: number; y: number; z: number }[]) => motion.inject(samples),
    },
    logs: {
      haptics: () => hapticLog.slice(),
      narrator: () => narratorLog.slice(),
      analytics: () => analyticsLog.slice(),
      share: () => shareLog.slice(),
    },
  };
  (globalThis as unknown as { __CS__: typeof bridge }).__CS__ = bridge;
}
