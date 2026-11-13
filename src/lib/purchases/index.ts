import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useEntitlementStore } from '@/stores/entitlement';
import { whenStoresHydrated } from '@/stores/persist';
import type {
  EntitlementSnapshot,
  Offerings,
  ProductId,
  PurchaseOutcome,
  RestoreOutcome,
} from '@/types';

import { resolvePurchasesMode, type PurchasesMode } from './config';
import { createMockProvider } from './mock';
import { OfferingsError, type PurchasesProvider } from './provider';
import { createRevenueCatProvider } from './revenuecat';

export { OfferingsError } from './provider';
export { mockControl } from './mock';
export { ENTITLEMENT_ID, STORE_PRODUCT_IDS, IS_EXPO_GO } from './config';

/** Release build with no store key: nothing can be bought and nothing is granted. */
function createUnavailableProvider(): PurchasesProvider {
  return {
    mode: 'unavailable',
    async configure() {},
    async getOfferings(): Promise<Offerings> {
      throw new OfferingsError('Purchases are not configured in this build.', 'unconfigured');
    },
    async purchase(): Promise<PurchaseOutcome> {
      return { status: 'failed', code: 'store', message: 'Purchases are not available in this build.' };
    },
    async restore(): Promise<RestoreOutcome> {
      return { status: 'failed', message: 'Purchases are not available in this build.' };
    },
    async getEntitlement() {
      return null;
    },
    onEntitlementChange() {
      return () => {};
    },
  };
}

let provider: PurchasesProvider | null = null;
let mockProvider: ReturnType<typeof createMockProvider> | null = null;

function getProvider(): PurchasesProvider {
  if (provider) return provider;
  const mode = resolvePurchasesMode();
  if (mode === 'revenuecat') provider = createRevenueCatProvider();
  else if (mode === 'mock') {
    mockProvider = createMockProvider();
    provider = mockProvider;
  } else provider = createUnavailableProvider();
  provider.onEntitlementChange(applySnapshot);
  return provider;
}

function applySnapshot(snapshot: EntitlementSnapshot) {
  useEntitlementStore.getState().apply(snapshot);
}

/**
 * The app-facing purchases API. Screens use this — never a provider directly.
 * Every call that learns the entitlement writes it to the cached store, which
 * is what the route guards read.
 */
export const purchases = {
  get mode(): PurchasesMode {
    return getProvider().mode;
  },

  /** True when purchases are simulated (Expo Go, web, preview builds). Paywall shows a "Test mode" note. */
  get isMock(): boolean {
    return getProvider().mode === 'mock';
  },

  getOfferings(): Promise<Offerings> {
    return getProvider().getOfferings();
  },

  async purchase(id: ProductId): Promise<PurchaseOutcome> {
    const outcome = await getProvider().purchase(id);
    if (outcome.status === 'purchased') await purchases.refresh();
    return outcome;
  },

  async restore(): Promise<RestoreOutcome> {
    const outcome = await getProvider().restore();
    if (outcome.status === 'restored') await purchases.refresh();
    return outcome;
  },

  /**
   * Re-check the entitlement with the store. If the store can't be reached the
   * cached entitlement is left exactly as it is (offline users keep access).
   */
  async refresh(): Promise<void> {
    await whenStoresHydrated();
    const snapshot = await getProvider().getEntitlement();
    if (snapshot) applySnapshot(snapshot);
  },

  /** Mock-only controls for the developer panel and tests. No-ops on real providers. */
  dev: {
    async expireNow(): Promise<void> {
      getProvider();
      await mockProvider?.expireNow();
    },
    async clearAccount(): Promise<void> {
      getProvider();
      await mockProvider?.clearAccount();
      useEntitlementStore.getState().clear();
    },
  },
};

/** Mount once at the app root: configures the store and keeps the entitlement fresh. */
export function usePurchasesLifecycle(): void {
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        await getProvider().configure();
        if (alive) await purchases.refresh();
      } catch {
        // Store unreachable: cached entitlement stands.
      }
    })();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void purchases.refresh().catch(() => {});
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
}
