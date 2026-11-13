import type { Airport } from '@/types';

const R_KM = 6371.0088;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export interface LatLon {
  lat: number;
  lon: number;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const kmToNm = (km: number) => km / 1.852;
export const kmToMiles = (km: number) => km / 1.609344;

/**
 * Rough gate-to-gate duration for an airliner, in minutes. An estimate the user
 * can always edit: ~30 minutes of taxi/climb/descent overhead plus cruise at
 * ~830 km/h. Rounded to 5 minutes.
 */
export function estimateDurationMin(km: number): number {
  const minutes = 30 + (km / 830) * 60;
  return Math.max(30, Math.round(minutes / 5) * 5);
}

/** `n` points along the great circle from a to b (inclusive), for drawing arcs and sampling corridors. */
export function greatCirclePoints(a: LatLon, b: LatLon, n = 32): LatLon[] {
  const φ1 = toRad(a.lat);
  const λ1 = toRad(a.lon);
  const φ2 = toRad(b.lat);
  const λ2 = toRad(b.lon);
  const δ = distanceKm(a, b) / R_KM;
  if (δ < 1e-9) return [a, b];
  const out: LatLon[] = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const A = Math.sin((1 - f) * δ) / Math.sin(δ);
    const B = Math.sin(f * δ) / Math.sin(δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push({ lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), lon: toDeg(Math.atan2(y, x)) });
  }
  return out;
}

/** Shortest distance in km from point p to the great-circle path a→b (clamped to the segment). */
export function distanceToRouteKm(p: LatLon, a: LatLon, b: LatLon): number {
  const pts = greatCirclePoints(a, b, 48);
  let best = Infinity;
  for (const q of pts) best = Math.min(best, distanceKm(p, q));
  return best;
}

export function routeLabel(from: Airport, to: Airport): string {
  return `${from.iata} → ${to.iata}`;
}

export function formatDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}
