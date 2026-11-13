/**
 * Time-zone helpers. Flights are entered as wall-clock time at the ORIGIN airport
 * (what the ticket says), and stored as a UTC instant, so countdowns stay correct
 * when the traveller's phone is in a different zone.
 */

interface Parts {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string): Intl.DateTimeFormat | null {
  const hit = fmtCache.get(tz);
  if (hit) return hit;
  try {
    const f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    fmtCache.set(tz, f);
    return f;
  } catch {
    return null;
  }
}

function partsIn(epoch: number, tz: string): Parts | null {
  const f = formatter(tz);
  if (!f) return null;
  try {
    const out: Record<string, number> = {};
    for (const p of f.formatToParts(new Date(epoch))) {
      if (p.type !== 'literal') out[p.type] = Number(p.value);
    }
    if ([out.year, out.month, out.day, out.hour, out.minute].some((v) => !Number.isFinite(v))) {
      return null;
    }
    return { y: out.year, mo: out.month, d: out.day, h: out.hour % 24, mi: out.minute };
  } catch {
    return null;
  }
}

function parseLocal(local: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(local);
  if (!m) return null;
  const p = { y: +m[1], mo: +m[2], d: +m[3], h: m[4] ? +m[4] : 0, mi: m[5] ? +m[5] : 0 };
  if (p.mo < 1 || p.mo > 12 || p.d < 1 || p.d > 31 || p.h > 23 || p.mi > 59) return null;
  return p;
}

const asUtc = (p: Parts) => Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
const pad = (n: number) => String(n).padStart(2, '0');

/** Offset (ms) of `tz` from UTC at the instant `epoch` (positive = ahead of UTC). */
export function tzOffsetMs(epoch: number, tz: string): number {
  const p = partsIn(epoch, tz);
  if (!p) return -new Date(epoch).getTimezoneOffset() * 60_000;
  // Compare at minute precision.
  return asUtc(p) - Math.floor(epoch / 60_000) * 60_000;
}

/**
 * "YYYY-MM-DDTHH:mm" wall-clock time in `tz` -> UTC epoch ms.
 * Falls back to the device zone if `tz` is unknown to the runtime. Returns NaN
 * for an unparseable string. During a spring-forward gap the later instant is used.
 */
export function zonedLocalToEpoch(local: string, tz: string): number {
  const p = parseLocal(local);
  if (!p) return NaN;
  if (!formatter(tz)) return new Date(p.y, p.mo - 1, p.d, p.h, p.mi).getTime();
  const guess = asUtc(p);
  // Two passes settle DST transitions.
  let epoch = guess - tzOffsetMs(guess, tz);
  epoch = guess - tzOffsetMs(epoch, tz);
  return epoch;
}

/** UTC epoch ms -> "YYYY-MM-DDTHH:mm" wall-clock time in `tz`. */
export function epochToZonedLocal(epoch: number, tz: string): string {
  const p = partsIn(epoch, tz);
  if (!p) {
    const d = new Date(epoch);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Sat 14 Nov" from a local stamp. Pure string maths, so it never shifts by zone. */
export function formatLocalDate(local: string): string {
  const p = parseLocal(local);
  if (!p) return '';
  const dow = new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay();
  return `${DAYS[dow]} ${p.d} ${MONTHS[p.mo - 1]}`;
}

/** "14:05" from a local stamp. */
export function formatLocalTime(local: string): string {
  const p = parseLocal(local);
  return p ? `${pad(p.h)}:${pad(p.mi)}` : '';
}

/** "14:05" for an instant, in the device's own zone (for "Checked at…" labels). */
export function formatClock(epoch: number): string {
  const d = new Date(epoch);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Whole calendar days from `now` until the local date of `departLocal` at the origin (0 = today there). */
export function daysUntil(departAt: number, now: number): number {
  return Math.floor((departAt - now) / 86_400_000);
}

/** Calm, coarse relative phrasing — deliberately not a ticking countdown. */
export function describeTimeUntil(departAt: number, now: number): string {
  const ms = departAt - now;
  if (ms <= -60 * 60_000) return 'Departure time has passed';
  if (ms <= 0) return 'Departing about now';
  const hours = ms / 3_600_000;
  if (hours < 1) return 'Departs within the hour';
  if (hours < 24) return `Departs in about ${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Departs tomorrow';
  if (days < 14) return `Departs in ${days} days`;
  const weeks = Math.round(days / 7);
  return `Departs in about ${weeks} weeks`;
}
