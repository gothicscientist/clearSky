import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Persisted-store factory used by every store in the app (foundation and features).
 *
 * Guarantees:
 *  - versioned envelope with a `migrate` hook
 *  - corrupt / unparseable payloads never crash the app: the store falls back to
 *    its initial state and the bad payload is moved aside under `<key>.corrupt`
 *  - hydration is observable (`useStoresHydrated`) so the UI never flashes the
 *    wrong route while data is loading
 */

const STORAGE_PREFIX = 'clearsky.';

type HydrationListener = () => void;
const pending = new Set<string>();
const listeners = new Set<HydrationListener>();
let anyRegistered = false;

function notify() {
  listeners.forEach((l) => l());
}

function markHydrated(name: string) {
  if (pending.delete(name)) notify();
}

/** True once every persisted store created so far has finished loading from disk. */
export function storesHydrated(): boolean {
  return anyRegistered && pending.size === 0;
}

export function useStoresHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    storesHydrated,
    () => false,
  );
}

/** Resolves when all stores are hydrated. Used by tests and startup code. */
export function whenStoresHydrated(): Promise<void> {
  if (storesHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (storesHydrated()) {
        listeners.delete(check);
        resolve();
      }
    };
    listeners.add(check);
  });
}

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw == null) return null;
      // Validate here so a corrupt payload is quarantined instead of throwing inside zustand.
      JSON.parse(raw);
      return raw;
    } catch {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw != null) await AsyncStorage.setItem(`${key}.corrupt`, raw);
        await AsyncStorage.removeItem(key);
      } catch {
        // Storage itself is unavailable; run in-memory.
      }
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Out of quota / private mode: keep working in memory.
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const registry: { name: string; reset: () => void }[] = [];

export interface PersistedOptions<S> {
  /** Storage key suffix, e.g. "profile" -> clearsky.profile */
  name: string;
  version: number;
  /** Upgrade older payloads. Must tolerate partial/unknown shapes. */
  migrate?: (persisted: unknown, fromVersion: number) => Partial<S>;
  /** Pick the serialisable subset (defaults to everything that is not a function). */
  partialize?: (state: S) => Partial<S>;
}

export function createPersistedStore<S extends object>(
  options: PersistedOptions<S>,
  creator: StateCreator<S, [], []>,
) {
  const key = STORAGE_PREFIX + options.name;
  anyRegistered = true;
  pending.add(options.name);

  const store = create<S>()(
    persist(creator, {
      name: key,
      version: options.version,
      storage: createJSONStorage(() => safeStorage),
      partialize: (options.partialize ??
        ((state: S) =>
          Object.fromEntries(
            Object.entries(state).filter(([, v]) => typeof v !== 'function'),
          ) as Partial<S>)) as (state: S) => S,
      migrate: (persisted, fromVersion) => {
        try {
          return (options.migrate ? options.migrate(persisted, fromVersion) : persisted) as S;
        } catch {
          return {} as S;
        }
      },
      // Shallow-merge persisted data over fresh defaults so new fields get defaults.
      merge: (persisted, current) => {
        if (persisted == null || typeof persisted !== 'object') return current;
        return { ...current, ...(persisted as Partial<S>) };
      },
      onRehydrateStorage: () => () => {
        markHydrated(options.name);
      },
    }),
  );

  const initial = store.getInitialState();
  registry.push({
    name: options.name,
    reset: () => store.setState(initial, true),
  });

  return store;
}

/** Erase every persisted store (Settings -> "Delete all my data", and e2e resets). */
export async function resetAllStores(): Promise<void> {
  registry.forEach((r) => r.reset());
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(STORAGE_PREFIX)));
  } catch {
    // ignore
  }
}

/** Raw export of all persisted data for Settings -> "Export my data". */
export async function exportAllData(): Promise<string> {
  const out: Record<string, unknown> = {};
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(STORAGE_PREFIX));
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [k, v] of pairs) {
      if (v == null) continue;
      try {
        out[k] = JSON.parse(v);
      } catch {
        out[k] = v;
      }
    }
  } catch {
    // ignore
  }
  return JSON.stringify({ app: 'clearSky', exportedAt: new Date().toISOString(), data: out }, null, 2);
}
