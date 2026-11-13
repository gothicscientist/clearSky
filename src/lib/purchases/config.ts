import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Purchases configuration. Everything the owner must set up lives in env vars
 * (see .env.example and docs/SETUP.md) — no keys are committed.
 */

/** RevenueCat entitlement identifier that unlocks the app. */
export const ENTITLEMENT_ID = 'pro';

/** App Store Connect product identifiers. Must match the store and RevenueCat exactly. */
export const STORE_PRODUCT_IDS = {
  weekly: process.env.EXPO_PUBLIC_IAP_WEEKLY_ID || 'clearsky_pro_weekly',
  yearly: process.env.EXPO_PUBLIC_IAP_YEARLY_ID || 'clearsky_pro_yearly',
} as const;

export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';

export type PurchasesMode = 'revenuecat' | 'mock' | 'unavailable';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Which provider runs:
 *  - `EXPO_PUBLIC_PURCHASES_MODE=mock|revenuecat` forces a mode (used for preview/TestFlight
 *    builds before the store is configured, and by e2e).
 *  - Expo Go and web have no StoreKit -> mock.
 *  - Native build with a RevenueCat key -> revenuecat.
 *  - Native build without a key -> unavailable: the paywall shows the store-unreachable
 *    state and NEVER grants access. A misconfigured release can't give the app away.
 */
export function resolvePurchasesMode(): PurchasesMode {
  const forced = process.env.EXPO_PUBLIC_PURCHASES_MODE;
  if (forced === 'mock') return 'mock';
  if (forced === 'revenuecat') return REVENUECAT_IOS_KEY ? 'revenuecat' : 'unavailable';
  if (Platform.OS === 'web' || isExpoGo) return 'mock';
  if (Platform.OS === 'ios' && REVENUECAT_IOS_KEY) return 'revenuecat';
  return 'unavailable';
}

export const IS_EXPO_GO = isExpoGo;
