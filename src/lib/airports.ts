import type { Airport } from '@/types';

import raw from '../../assets/data/airports.json';

/**
 * Bundled, fully offline airport database: ~3,200 airports with scheduled
 * service, from OurAirports (public domain). Rebuild with
 * `node scripts/build-airports.mjs`.
 *
 * clearSky deliberately has NO flight-number lookup: the traveller picks the two
 * airports printed on their ticket, so the route can never be silently wrong.
 */

type Row = [string, string, string, string, string, number, number, string, number];

interface Indexed {
  airport: Airport;
  large: boolean;
  /** lower-cased haystacks */
  city: string;
  name: string;
}

let index: Indexed[] | null = null;
let byIata: Map<string, Airport> | null = null;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function build(): Indexed[] {
  if (index) return index;
  const rows = (raw as unknown as { airports: Row[] }).airports;
  index = rows.map((r) => {
    const airport: Airport = {
      iata: r[0],
      icao: r[1],
      name: r[2],
      city: r[3] || r[2],
      country: r[4],
      lat: r[5],
      lon: r[6],
      tz: r[7],
    };
    return { airport, large: r[8] === 1, city: normalise(airport.city), name: normalise(airport.name) };
  });
  byIata = new Map(index.map((i) => [i.airport.iata, i.airport]));
  return index;
}

export const AIRPORT_DATA_SOURCE = 'OurAirports (public domain), ourairports.com';

export function airportCount(): number {
  return build().length;
}

export function getAirport(iata: string): Airport | null {
  build();
  return byIata?.get(iata.trim().toUpperCase()) ?? null;
}

/**
 * Rank airports for a free-text query (code, city or airport name).
 * Exact IATA match first, then city prefix, name-word prefix, substring; large
 * airports break ties. Empty query returns [].
 */
export function searchAirports(query: string, limit = 12): Airport[] {
  const q = normalise(query);
  if (!q) return [];
  const upper = q.toUpperCase();
  const scored: { a: Indexed; score: number }[] = [];
  for (const a of build()) {
    let score = 0;
    if (a.airport.iata === upper) score = 100;
    else if (a.airport.icao === upper) score = 90;
    else if (a.city === q) score = 80;
    else if (a.city.startsWith(q)) score = 70;
    else if (a.city.split(' ').some((w) => w.startsWith(q))) score = 60;
    else if (a.name.split(' ').some((w) => w.startsWith(q))) score = 50;
    else if (q.length >= 2 && a.airport.iata.startsWith(upper)) score = 45;
    else if (q.length >= 3 && (a.city.includes(q) || a.name.includes(q))) score = 30;
    if (score > 0) scored.push({ a, score: score + (a.large ? 5 : 0) });
  }
  scored.sort(
    (x, y) => y.score - x.score || x.a.airport.city.localeCompare(y.a.airport.city),
  );
  return scored.slice(0, limit).map((s) => s.a.airport);
}

/** "New York (JFK)" */
export function airportLabel(a: Airport): string {
  return `${a.city} (${a.iata})`;
}
