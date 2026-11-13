import type { Href } from 'expo-router';

/**
 * Every cross-feature navigation target. Features navigate to each other ONLY
 * through these helpers, never with hand-written path strings, so a route can
 * move without breaking another workstream.
 */
export const routes = {
  onboarding: '/onboarding' as Href,
  paywall: '/paywall' as Href,
  settings: '/settings' as Href,
  /** Readable before purchase (linked from the paywall). */
  legal: (doc: 'terms' | 'privacy' | 'licences') => ({ pathname: '/legal/[doc]', params: { doc } }) as Href,
  /** Crisis and medical guidance. Always reachable, offline, never behind the paywall. */
  crisis: '/crisis' as Href,
  sos: '/sos' as Href,

  today: '/today' as Href,
  addFlight: '/today/add-flight' as Href,
  flight: (id: string) => ({ pathname: '/today/flight/[id]', params: { id } }) as Href,
  outlook: (id: string) => ({ pathname: '/today/outlook/[id]', params: { id } }) as Href,

  fly: '/fly' as Href,
  /** Optional `flightId` starts/resumes the companion for that flight. */
  companion: (flightId?: string) =>
    (flightId ? { pathname: '/fly/companion', params: { flightId } } : '/fly/companion') as Href,
  sounds: '/fly/sounds' as Href,
  gmeter: '/fly/gmeter' as Href,

  calm: '/calm' as Href,
  /** Optional `pattern` preselects a breathing pattern id. */
  breathe: (pattern?: string) =>
    (pattern ? { pathname: '/calm/breathe', params: { pattern } } : '/calm/breathe') as Href,
  ground: '/calm/ground' as Href,
  games: '/calm/games' as Href,

  learn: '/learn' as Href,
  lesson: (id: string) => ({ pathname: '/learn/lesson/[id]', params: { id } }) as Href,
  program: (id: string) => ({ pathname: '/learn/program/[id]', params: { id } }) as Href,
  sources: '/learn/sources' as Href,

  debrief: (flightId: string) =>
    ({ pathname: '/journey/debrief/[flightId]', params: { flightId } }) as Href,
  logbook: '/journey/logbook' as Href,
  card: (flightId: string) => ({ pathname: '/journey/card/[flightId]', params: { flightId } }) as Href,
} as const;
