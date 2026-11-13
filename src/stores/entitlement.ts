import type { EntitlementSnapshot, ProductId } from '@/types';

import { clock } from '@/lib/clock';

import { createPersistedStore } from './persist';

/**
 * Cached subscription state. The purchases provider is the source of truth while
 * online; this cache is what lets the whole app work in airplane mode.
 *
 * Offline rule: a cached active entitlement stays active until the provider
 * positively reports it inactive. We never lock a paying user out mid-flight just
 * because `expiresAt` passed while they had no connection — but the grace is bounded
 * (OFFLINE_GRACE_MS) so a lapsed subscription can't be kept alive by staying offline.
 */

export const OFFLINE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

interface EntitlementState {
  active: boolean;
  productId: ProductId | null;
  expiresAt: number | null;
  /** Epoch ms of the last answer from the store/provider */
  verifiedAt: number | null;

  apply: (snapshot: EntitlementSnapshot, verifiedAt?: number) => void;
  clear: () => void;
}

export const useEntitlementStore = createPersistedStore<EntitlementState>(
  { name: 'entitlement', version: 1 },
  (set) => ({
    active: false,
    productId: null,
    expiresAt: null,
    verifiedAt: null,

    apply: (snapshot, verifiedAt = clock.now()) =>
      set({
        active: snapshot.active,
        productId: snapshot.active ? snapshot.productId : null,
        expiresAt: snapshot.active ? snapshot.expiresAt : null,
        verifiedAt,
      }),
    clear: () => set({ active: false, productId: null, expiresAt: null, verifiedAt: null }),
  }),
);

/** Pure access decision, exported for tests. */
export function hasAccess(
  s: Pick<EntitlementState, 'active' | 'expiresAt'>,
  now: number = clock.now(),
): boolean {
  if (!s.active) return false;
  if (s.expiresAt == null) return true;
  return now < s.expiresAt + OFFLINE_GRACE_MS;
}

export const usePro = () => useEntitlementStore((s) => hasAccess(s));
