import type {
  EntitlementSnapshot,
  Offerings,
  ProductId,
  PurchaseOutcome,
  RestoreOutcome,
  StoreProduct,
} from '@/types';

import { ENTITLEMENT_ID, REVENUECAT_IOS_KEY, STORE_PRODUCT_IDS } from './config';
import { OfferingsError, type PurchasesProvider } from './provider';

/**
 * RevenueCat-backed provider for native builds.
 *
 * The SDK is `require`d lazily so that Expo Go and web never load the native
 * module. Users are anonymous (RevenueCat-generated app user id): no account,
 * no identifiers of ours.
 */

type RC = typeof import('react-native-purchases');
type RCDefault = RC['default'];
type CustomerInfo = Awaited<ReturnType<RCDefault['getCustomerInfo']>>;
type RCPackage = NonNullable<
  NonNullable<Awaited<ReturnType<RCDefault['getOfferings']>>['current']>['annual']
>;

function loadSdk(): RCDefault {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('react-native-purchases') as RC).default;
}

function productIdFor(storeId: string | undefined): ProductId | null {
  if (!storeId) return null;
  if (storeId === STORE_PRODUCT_IDS.weekly) return 'weekly';
  if (storeId === STORE_PRODUCT_IDS.yearly) return 'yearly';
  // Fall back on naming so a renamed SKU still maps to something sensible.
  if (/week/i.test(storeId)) return 'weekly';
  if (/year|annual/i.test(storeId)) return 'yearly';
  return null;
}

function toSnapshot(info: CustomerInfo): EntitlementSnapshot {
  const ent = info.entitlements.active[ENTITLEMENT_ID];
  if (!ent || !ent.isActive) return { active: false, productId: null, expiresAt: null };
  return {
    active: true,
    productId: productIdFor(ent.productIdentifier),
    expiresAt: ent.expirationDateMillis ?? null,
  };
}

function describeIntro(pkg: RCPackage): string | null {
  const intro = pkg.product.introPrice;
  if (!intro) return null;
  const unit = intro.periodUnit.toLowerCase();
  const n = intro.periodNumberOfUnits;
  const span = `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (intro.price === 0) return `${span} free`;
  return `${intro.priceString} for the first ${span}`;
}

function toProduct(id: ProductId, pkg: RCPackage | null | undefined): StoreProduct | null {
  if (!pkg) return null;
  return {
    id,
    storeId: pkg.product.identifier,
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currencyCode: pkg.product.currencyCode,
    period: id === 'weekly' ? 'week' : 'year',
    introOffer: describeIntro(pkg),
  };
}

export function createRevenueCatProvider(): PurchasesProvider {
  let Purchases: RCDefault | null = null;
  let configured = false;
  const packages: Partial<Record<ProductId, RCPackage>> = {};
  const listeners = new Set<(e: EntitlementSnapshot) => void>();

  const sdk = (): RCDefault => {
    if (!Purchases) Purchases = loadSdk();
    return Purchases;
  };

  return {
    mode: 'revenuecat',

    async configure() {
      if (configured) return;
      const P = sdk();
      if (__DEV__) void P.setLogLevel(P.LOG_LEVEL.WARN);
      P.configure({ apiKey: REVENUECAT_IOS_KEY });
      P.addCustomerInfoUpdateListener((info) => {
        const snap = toSnapshot(info);
        listeners.forEach((l) => l(snap));
      });
      configured = true;
    },

    async getOfferings(): Promise<Offerings> {
      try {
        await this.configure();
        const offerings = await sdk().getOfferings();
        const current = offerings.current;
        if (!current) {
          throw new OfferingsError('No offering is configured in RevenueCat.', 'unconfigured');
        }
        const find = (id: ProductId, fallback: RCPackage | null) =>
          current.availablePackages.find(
            (p) => p.product.identifier === STORE_PRODUCT_IDS[id],
          ) ?? fallback;
        const weekly = find('weekly', current.weekly);
        const yearly = find('yearly', current.annual);
        if (weekly) packages.weekly = weekly;
        if (yearly) packages.yearly = yearly;
        if (!weekly && !yearly) {
          throw new OfferingsError('No products are available.', 'unconfigured');
        }
        return { weekly: toProduct('weekly', weekly), yearly: toProduct('yearly', yearly) };
      } catch (e) {
        if (e instanceof OfferingsError) throw e;
        throw new OfferingsError(e instanceof Error ? e.message : 'Store error', 'network');
      }
    },

    async purchase(id: ProductId): Promise<PurchaseOutcome> {
      const P = sdk();
      try {
        await this.configure();
        let pkg = packages[id];
        if (!pkg) {
          await this.getOfferings();
          pkg = packages[id];
        }
        if (!pkg) {
          return { status: 'failed', code: 'store', message: 'That plan is not available right now.' };
        }
        const result = await P.purchasePackage(pkg);
        const snap = toSnapshot(result.customerInfo);
        if (snap.active) {
          listeners.forEach((l) => l(snap));
          return { status: 'purchased' };
        }
        // Paid but entitlement not attached: almost always a RevenueCat product/entitlement mapping issue.
        return {
          status: 'failed',
          code: 'store',
          message: 'Your purchase went through but is not active yet. Tap Restore Purchases.',
        };
      } catch (e) {
        const err = e as { code?: string; userCancelled?: boolean; message?: string };
        const codes = P.PURCHASES_ERROR_CODE;
        if (err.userCancelled || err.code === codes.PURCHASE_CANCELLED_ERROR) {
          return { status: 'cancelled' };
        }
        if (err.code === codes.PAYMENT_PENDING_ERROR) return { status: 'pending' };
        if (err.code === codes.NETWORK_ERROR || err.code === codes.OFFLINE_CONNECTION_ERROR) {
          return { status: 'failed', code: 'network', message: 'No connection. Nothing was charged.' };
        }
        if (err.code === codes.PURCHASE_NOT_ALLOWED_ERROR) {
          return {
            status: 'failed',
            code: 'notAllowed',
            message: 'Purchases are not allowed on this device. Check Screen Time restrictions.',
          };
        }
        if (err.code === codes.PRODUCT_ALREADY_PURCHASED_ERROR) {
          const restored = await this.restore();
          if (restored.status === 'restored') return { status: 'purchased' };
        }
        return {
          status: 'failed',
          code: 'store',
          message: 'The purchase did not go through. Nothing was charged.',
        };
      }
    },

    async restore(): Promise<RestoreOutcome> {
      try {
        await this.configure();
        const info = await sdk().restorePurchases();
        const snap = toSnapshot(info);
        if (!snap.active) return { status: 'nothingToRestore' };
        listeners.forEach((l) => l(snap));
        return { status: 'restored' };
      } catch {
        return { status: 'failed', message: 'The App Store did not answer. Try again in a moment.' };
      }
    },

    async getEntitlement(): Promise<EntitlementSnapshot | null> {
      try {
        await this.configure();
        return toSnapshot(await sdk().getCustomerInfo());
      } catch {
        return null;
      }
    },

    onEntitlementChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}
