import AsyncStorage from '@react-native-async-storage/async-storage';

import { clock } from '@/lib/clock';
import { net } from '@/lib/net';
import type {
  EntitlementSnapshot,
  Offerings,
  ProductId,
  PurchaseOutcome,
  RestoreOutcome,
} from '@/types';

import { STORE_PRODUCT_IDS } from './config';
import { OfferingsError, type PurchasesProvider } from './provider';

/**
 * Mock store used in Expo Go, on web and in e2e. It behaves like the real thing
 * (latency, offline failures, a persisted "account" that restore can find) and
 * its next outcomes are scriptable from the developer panel and the test bridge.
 *
 * Prices here are sample values for the mock only — real builds always show the
 * App Store's localised prices.
 */

const ACCOUNT_KEY = 'clearsky.mockstore.account';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type MockPurchaseScript = 'success' | 'cancelled' | 'pending' | 'failed' | 'network';
export type MockRestoreScript = 'auto' | 'restored' | 'nothing' | 'failed';
export type MockOfferingsScript = 'ok' | 'fail' | 'hang';

interface MockAccount {
  productId: ProductId;
  expiresAt: number;
}

export const mockControl = {
  nextPurchase: 'success' as MockPurchaseScript,
  nextRestore: 'auto' as MockRestoreScript,
  offerings: 'ok' as MockOfferingsScript,
  latencyMs: 450,
  reset() {
    this.nextPurchase = 'success';
    this.nextRestore = 'auto';
    this.offerings = 'ok';
    this.latencyMs = 450;
  },
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function readAccount(): Promise<MockAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockAccount;
    if (parsed && (parsed.productId === 'weekly' || parsed.productId === 'yearly')) return parsed;
    return null;
  } catch {
    return null;
  }
}

async function writeAccount(account: MockAccount | null): Promise<void> {
  try {
    if (account) await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    else await AsyncStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // ignore
  }
}

function snapshot(account: MockAccount | null): EntitlementSnapshot {
  if (account && account.expiresAt > clock.now()) {
    return { active: true, productId: account.productId, expiresAt: account.expiresAt };
  }
  return { active: false, productId: null, expiresAt: null };
}

export function createMockProvider(): PurchasesProvider & {
  /** Test/dev: make the mock account lapse now and notify listeners. */
  expireNow(): Promise<void>;
  /** Test/dev: wipe the mock store account (as if never purchased). */
  clearAccount(): Promise<void>;
} {
  const listeners = new Set<(e: EntitlementSnapshot) => void>();
  const emit = (e: EntitlementSnapshot) => listeners.forEach((l) => l(e));

  return {
    mode: 'mock',

    async configure() {},

    async getOfferings(): Promise<Offerings> {
      if (mockControl.offerings === 'hang') {
        await wait(60_000);
        throw new OfferingsError('The store did not respond.', 'network');
      }
      await wait(mockControl.latencyMs);
      if (net.isForcedOffline() || mockControl.offerings === 'fail') {
        throw new OfferingsError('The store could not be reached.', 'network');
      }
      return {
        weekly: {
          id: 'weekly',
          storeId: STORE_PRODUCT_IDS.weekly,
          priceString: '$5.99',
          price: 5.99,
          currencyCode: 'USD',
          period: 'week',
          introOffer: null,
        },
        yearly: {
          id: 'yearly',
          storeId: STORE_PRODUCT_IDS.yearly,
          priceString: '$39.99',
          price: 39.99,
          currencyCode: 'USD',
          period: 'year',
          introOffer: null,
        },
      };
    },

    async purchase(id: ProductId): Promise<PurchaseOutcome> {
      await wait(mockControl.latencyMs + 250);
      if (net.isForcedOffline()) {
        return { status: 'failed', code: 'network', message: 'No connection. Nothing was charged.' };
      }
      const script = mockControl.nextPurchase;
      // One-shot: a scripted failure applies to the next attempt only.
      mockControl.nextPurchase = 'success';
      switch (script) {
        case 'cancelled':
          return { status: 'cancelled' };
        case 'pending':
          return { status: 'pending' };
        case 'failed':
          return {
            status: 'failed',
            code: 'store',
            message: 'The purchase did not go through. Nothing was charged.',
          };
        case 'network':
          return { status: 'failed', code: 'network', message: 'No connection. Nothing was charged.' };
        case 'success':
        default: {
          const account: MockAccount = {
            productId: id,
            expiresAt: clock.now() + (id === 'weekly' ? WEEK_MS : YEAR_MS),
          };
          await writeAccount(account);
          emit(snapshot(account));
          return { status: 'purchased' };
        }
      }
    },

    async restore(): Promise<RestoreOutcome> {
      await wait(mockControl.latencyMs + 250);
      if (net.isForcedOffline()) {
        return { status: 'failed', message: 'No connection. Connect to restore your purchase.' };
      }
      const script = mockControl.nextRestore;
      mockControl.nextRestore = 'auto';
      if (script === 'failed') {
        return { status: 'failed', message: 'The App Store did not answer. Try again in a moment.' };
      }
      if (script === 'nothing') return { status: 'nothingToRestore' };
      let account = await readAccount();
      if (script === 'restored' && (!account || account.expiresAt <= clock.now())) {
        account = { productId: 'yearly', expiresAt: clock.now() + YEAR_MS };
        await writeAccount(account);
      }
      const snap = snapshot(account);
      if (!snap.active) return { status: 'nothingToRestore' };
      emit(snap);
      return { status: 'restored' };
    },

    async getEntitlement(): Promise<EntitlementSnapshot | null> {
      if (net.isForcedOffline()) return null;
      return snapshot(await readAccount());
    },

    onEntitlementChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    async expireNow() {
      const account = await readAccount();
      if (account) await writeAccount({ ...account, expiresAt: clock.now() - 1000 });
      emit({ active: false, productId: null, expiresAt: null });
    },

    async clearAccount() {
      await writeAccount(null);
    },
  };
}
