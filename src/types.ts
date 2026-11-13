/**
 * Shared domain types. This file is part of the FOUNDATION contract:
 * feature workstreams import from here and must not edit it without
 * coordinating through the orchestrator.
 */

export type FearType = 'turbulence' | 'crashing' | 'control' | 'panic' | 'takeoffLanding';

export type PeakMoment = 'daysBefore' | 'atGate' | 'takeoff' | 'cruiseBumps' | 'landing';

export type BodyResponse =
  | 'racingHeart'
  | 'tightChest'
  | 'sweatyHands'
  | 'spirallingThoughts'
  | 'dizzy';

export type NextFlightTiming = 'booked' | 'none' | 'avoiding';

export type Goal = 'boardCalmly' | 'stopDreading' | 'specificTrip' | 'flyMore';

export type TriedBefore = 'whiteKnuckling' | 'alcohol' | 'medication' | 'avoidance' | 'otherApps' | 'nothing';

export type DemoCheckIn = 'aLittle' | 'aLot' | 'notYet';

export interface OnboardingAnswers {
  fears: FearType[];
  primaryFear: FearType | null;
  peaks: PeakMoment[];
  body: BodyResponse[];
  nextFlight: NextFlightTiming | null;
  /** Local calendar date, YYYY-MM-DD */
  nextFlightDate: string | null;
  tried: TriedBefore[];
  demoCheckIn: DemoCheckIn | null;
  goal: Goal | null;
}

export type Appearance = 'dark' | 'light' | 'system';

export interface Settings {
  appearance: Appearance;
  haptics: boolean;
  /** Spoken guidance (on-device voice) */
  voice: boolean;
  /** Ambient sound beds */
  sound: boolean;
  /** Local pre-flight reminders */
  reminders: boolean;
  /** Preferred default breathing pattern id (see src/features/breathing) */
  breathingPattern: string;
}

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
  lat: number;
  lon: number;
  /** IANA time zone of the airport, e.g. "America/New_York" */
  tz: string;
}

export type FlightStatus = 'upcoming' | 'inFlight' | 'landed';

/** A running or finished in-flight companion session. Wall-clock based so it survives app kill. */
export interface CompanionSession {
  /** Epoch ms when the user tapped "Doors closed" */
  startedAt: number;
  /** Epoch ms when the user tapped "We've taken off" (airborne phases anchor here), else null */
  takeoffAt: number | null;
  /** Scheduled gate-to-gate minutes the timeline is stretched over */
  durationMin: number;
  /** Manual re-sync ("We're now at…"): ms added to elapsed time */
  offsetMs: number;
  endedAt: number | null;
}

export interface Debrief {
  /** 0–10 */
  actualFear: number;
  hardestMoment: PeakMoment | 'none' | null;
  toolsUsed: string[];
  reflection: string;
  completedAt: number;
}

export interface Flight {
  id: string;
  /**
   * Quick-start flight (Companion started with a duration only, no route). `from`/`to` are then
   * placeholders (QUICK_AIRPORT in src/stores/flights.ts): show "Your flight" and never draw a route.
   */
  quick: boolean;
  from: Airport;
  to: Airport;
  /** Scheduled departure as wall-clock time AT THE ORIGIN AIRPORT: YYYY-MM-DDTHH:mm */
  departLocal: string;
  /** The same moment as a UTC epoch ms (departLocal interpreted in `from.tz`) */
  departAt: number;
  /** Scheduled gate-to-gate minutes */
  durationMin: number;
  /** Great-circle distance in km, computed at creation */
  distanceKm: number;
  /** 0–10 predicted fear captured before the flight */
  expectedFear: number | null;
  status: FlightStatus;
  session: CompanionSession | null;
  debrief: Debrief | null;
  createdAt: number;
}

export type ToolKind =
  | 'sos'
  | 'breathing'
  | 'grounding'
  | 'game'
  | 'gmeter'
  | 'companion'
  | 'lesson'
  | 'program'
  | 'outlook';

export interface ToolSession {
  kind: ToolKind;
  /** Feature-specific id, e.g. breathing pattern or lesson id */
  ref: string;
  seconds: number;
  at: number;
  /** Optional outcome, e.g. SOS exit answer */
  outcome?: string;
}

export type ProductId = 'weekly' | 'yearly';

export interface StoreProduct {
  id: ProductId;
  /** Store identifier, e.g. clearsky_pro_yearly */
  storeId: string;
  /** Localised price string from the store, e.g. "$39.99". Never hard-code. */
  priceString: string;
  /** Numeric price in `currencyCode` */
  price: number;
  currencyCode: string;
  period: 'week' | 'year';
  /** Localised intro offer description if the store has one configured, else null */
  introOffer: string | null;
}

export interface Offerings {
  weekly: StoreProduct | null;
  yearly: StoreProduct | null;
}

export type PurchaseOutcome =
  | { status: 'purchased' }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'failed'; message: string; code: 'network' | 'store' | 'notAllowed' | 'unknown' };

export type RestoreOutcome =
  | { status: 'restored' }
  | { status: 'nothingToRestore' }
  | { status: 'failed'; message: string };

export interface EntitlementSnapshot {
  active: boolean;
  productId: ProductId | null;
  /** Epoch ms, null = unknown / non-expiring */
  expiresAt: number | null;
}
