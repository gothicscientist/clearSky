import { clock } from '@/lib/clock';
import { epochToZonedLocal, zonedLocalToEpoch } from '@/lib/time';
import type { Airport, CompanionSession, Debrief, Flight } from '@/types';

import { createPersistedStore } from './persist';

export interface NewFlightInput {
  from: Airport;
  to: Airport;
  departLocal: string;
  durationMin: number;
  distanceKm: number;
  expectedFear?: number | null;
}

/** Placeholder airport for quick-start flights (no route). Never shown as a place. */
export const QUICK_AIRPORT: Airport = {
  iata: '',
  icao: '',
  name: 'Not set',
  city: 'Your flight',
  country: '',
  lat: 0,
  lon: 0,
  tz: 'UTC',
};

interface FlightsState {
  flights: Flight[];

  addFlight: (input: NewFlightInput) => Flight;
  /** Companion quick start: a flight with only a duration, departing now. */
  addQuickFlight: (durationMin: number, expectedFear?: number | null) => Flight;
  updateFlight: (id: string, patch: Partial<Omit<Flight, 'id' | 'createdAt'>>) => void;
  removeFlight: (id: string) => void;
  /** "Doors closed": starts (or restarts) the companion timeline for this flight. */
  startSession: (id: string, startedAt?: number) => void;
  /** "We've taken off": anchors the airborne phases to the real wheels-up moment. */
  markTakeoff: (id: string, at?: number) => void;
  /** Manual phase correction: shift the timeline so elapsed time reads `elapsedMs` now. */
  resyncSession: (id: string, elapsedMs: number, now?: number) => void;
  /** "We've landed": ends the session and marks the flight landed. */
  endSession: (id: string, endedAt?: number) => void;
  saveDebrief: (id: string, debrief: Debrief) => void;
}

function makeId(): string {
  return `f_${clock.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampFear(v: number | null | undefined): number | null {
  if (v == null || Number.isNaN(v)) return null;
  return Math.max(0, Math.min(10, Math.round(v)));
}

export const useFlightsStore = createPersistedStore<FlightsState>(
  { name: 'flights', version: 1 },
  (set, get) => ({
    flights: [],

    addFlight: (input) => {
      const flight: Flight = {
        id: makeId(),
        quick: false,
        from: input.from,
        to: input.to,
        departLocal: input.departLocal,
        departAt: zonedLocalToEpoch(input.departLocal, input.from.tz),
        durationMin: Math.max(20, Math.round(input.durationMin)),
        distanceKm: Math.round(input.distanceKm),
        expectedFear: clampFear(input.expectedFear),
        status: 'upcoming',
        session: null,
        debrief: null,
        createdAt: clock.now(),
      };
      set((s) => ({ flights: [...s.flights, flight] }));
      return flight;
    },

    addQuickFlight: (durationMin, expectedFear) => {
      const now = clock.now();
      const flight: Flight = {
        id: makeId(),
        quick: true,
        from: QUICK_AIRPORT,
        to: QUICK_AIRPORT,
        departLocal: epochToZonedLocal(now, 'UTC'),
        departAt: now,
        durationMin: Math.max(20, Math.round(durationMin)),
        distanceKm: 0,
        expectedFear: clampFear(expectedFear),
        status: 'upcoming',
        session: null,
        debrief: null,
        createdAt: now,
      };
      set((s) => ({ flights: [...s.flights, flight] }));
      return flight;
    },

    updateFlight: (id, patch) =>
      set((s) => ({
        flights: s.flights.map((f) =>
          f.id === id
            ? withDepartAt({
                ...f,
                ...patch,
                expectedFear:
                  'expectedFear' in patch ? clampFear(patch.expectedFear) : f.expectedFear,
              })
            : f,
        ),
      })),

    removeFlight: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),

    startSession: (id, startedAt = clock.now()) =>
      set((s) => ({
        flights: s.flights.map((f) => {
          if (f.id === id) {
            const session: CompanionSession = {
              startedAt,
              takeoffAt: null,
              durationMin: f.durationMin,
              offsetMs: 0,
              endedAt: null,
            };
            return { ...f, status: 'inFlight' as const, session };
          }
          // Only one flight can be in the air at a time: close any other open session.
          if (f.status === 'inFlight' && f.session && f.session.endedAt == null) {
            return {
              ...f,
              status: 'landed' as const,
              session: { ...f.session, endedAt: startedAt },
            };
          }
          return f;
        }),
      })),

    markTakeoff: (id, at = clock.now()) =>
      set((s) => ({
        flights: s.flights.map((f) =>
          f.id === id && f.session && f.session.endedAt == null
            ? { ...f, session: { ...f.session, takeoffAt: Math.max(f.session.startedAt, at) } }
            : f,
        ),
      })),

    resyncSession: (id, elapsedMs, now = clock.now()) =>
      set((s) => ({
        flights: s.flights.map((f) =>
          f.id === id && f.session
            ? {
                ...f,
                session: {
                  ...f.session,
                  offsetMs: Math.max(0, elapsedMs) - (now - f.session.startedAt),
                },
              }
            : f,
        ),
      })),

    endSession: (id, endedAt = clock.now()) => {
      const flight = get().flights.find((f) => f.id === id);
      if (!flight) return;
      set((s) => ({
        flights: s.flights.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'landed' as const,
                session: f.session ? { ...f.session, endedAt: f.session.endedAt ?? endedAt } : null,
              }
            : f,
        ),
      }));
    },

    saveDebrief: (id, debrief) =>
      set((s) => ({
        flights: s.flights.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'landed' as const,
                debrief: { ...debrief, actualFear: clampFear(debrief.actualFear) ?? 0 },
              }
            : f,
        ),
      })),
  }),
);

function withDepartAt(f: Flight): Flight {
  if (f.quick) return f;
  return { ...f, departAt: zonedLocalToEpoch(f.departLocal, f.from.tz) };
}

/** "JFK → LAX", or "Your flight" for a quick start. */
export function flightTitle(f: Pick<Flight, 'quick' | 'from' | 'to'>): string {
  return f.quick ? 'Your flight' : `${f.from.iata} → ${f.to.iata}`;
}

/** Elapsed ms in a companion session at `now`, including manual corrections. Never negative. */
export function sessionElapsedMs(session: CompanionSession, now: number = clock.now()): number {
  const end = session.endedAt ?? now;
  return Math.max(0, end - session.startedAt + session.offsetMs);
}

/** Epoch ms (UTC) of a flight's scheduled departure. */
export function departEpoch(flight: Pick<Flight, 'departAt'>): number {
  return Number.isFinite(flight.departAt) ? flight.departAt : 0;
}

/** The flight currently in the air, if any. */
export function selectActiveFlight(flights: Flight[]): Flight | null {
  return flights.find((f) => f.status === 'inFlight' && f.session && f.session.endedAt == null) ?? null;
}

/** The next upcoming flight by departure time (flights without a session). */
export function selectNextFlight(flights: Flight[]): Flight | null {
  const upcoming = flights.filter((f) => f.status === 'upcoming');
  if (upcoming.length === 0) return null;
  return [...upcoming].sort((a, b) => departEpoch(a) - departEpoch(b))[0] ?? null;
}

/** Landed flights, newest first. */
export function selectLandedFlights(flights: Flight[]): Flight[] {
  return flights
    .filter((f) => f.status === 'landed')
    .sort((a, b) => (b.session?.endedAt ?? departEpoch(b)) - (a.session?.endedAt ?? departEpoch(a)));
}

/** Landed flights that still need a debrief, newest first. */
export function selectAwaitingDebrief(flights: Flight[]): Flight[] {
  return selectLandedFlights(flights).filter((f) => f.debrief == null);
}
