import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

/**
 * Connectivity. `forcedOffline` lets e2e tests and the developer panel simulate
 * airplane mode; every network call in the app must go through `fetchWithTimeout`
 * so that simulation (and real offline) is handled uniformly.
 */

let forcedOffline = false;
const listeners = new Set<() => void>();

export class OfflineError extends Error {
  constructor() {
    super('offline');
    this.name = 'OfflineError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('timeout');
    this.name = 'TimeoutError';
  }
}

export const net = {
  setForcedOffline(value: boolean): void {
    forcedOffline = value;
    listeners.forEach((l) => l());
  },
  isForcedOffline(): boolean {
    return forcedOffline;
  },
  async isOnline(): Promise<boolean> {
    if (forcedOffline) return false;
    try {
      const state = await Network.getNetworkStateAsync();
      // `isInternetReachable` can be null/undefined while unknown: treat unknown as online and let the request decide.
      return state.isConnected !== false && state.isInternetReachable !== false;
    } catch {
      return true;
    }
  },
};

/** Reactive online flag for UI ("You're offline — showing saved reports"). */
export function useOnline(): boolean {
  const [online, setOnline] = useState(!forcedOffline);
  useEffect(() => {
    let alive = true;
    const check = () => {
      void net.isOnline().then((v) => {
        if (alive) setOnline(v);
      });
    };
    check();
    listeners.add(check);
    let sub: { remove: () => void } | null = null;
    try {
      sub = Network.addNetworkStateListener(check);
    } catch {
      sub = null;
    }
    return () => {
      alive = false;
      listeners.delete(check);
      sub?.remove();
    };
  }, []);
  return online;
}

/**
 * fetch with a hard timeout and offline short-circuit.
 * Throws OfflineError, TimeoutError, or the underlying network error.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  if (forcedOffline) throw new OfflineError();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (controller.signal.aborted) throw new TimeoutError();
    if (!(await net.isOnline())) throw new OfflineError();
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
