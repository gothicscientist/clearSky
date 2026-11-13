import type {
  EntitlementSnapshot,
  Offerings,
  ProductId,
  PurchaseOutcome,
  RestoreOutcome,
} from '@/types';

export class OfferingsError extends Error {
  constructor(
    message: string,
    public readonly code: 'network' | 'store' | 'unconfigured',
  ) {
    super(message);
    this.name = 'OfferingsError';
  }
}

/**
 * The one interface the app uses for subscriptions. Implementations never throw
 * from purchase/restore (they return a typed outcome); getOfferings throws
 * OfferingsError so the paywall can show its store-unreachable state.
 */
export interface PurchasesProvider {
  readonly mode: 'revenuecat' | 'mock' | 'unavailable';
  configure(): Promise<void>;
  getOfferings(): Promise<Offerings>;
  purchase(id: ProductId): Promise<PurchaseOutcome>;
  restore(): Promise<RestoreOutcome>;
  /**
   * Ask the store for the current entitlement. Returns null when the store can't
   * be reached — callers must then keep the cached entitlement untouched.
   */
  getEntitlement(): Promise<EntitlementSnapshot | null>;
  /** Fires whenever the store reports a change (renewal, expiry, purchase elsewhere). */
  onEntitlementChange(cb: (e: EntitlementSnapshot) => void): () => void;
}
