/**
 * The app's only source of "now". Everything time-based (breathing pacing,
 * companion phases, countdowns, caches) reads the clock through here so that
 * e2e tests can move time forward deterministically.
 */
let offsetMs = 0;
const listeners = new Set<() => void>();

export const clock = {
  now(): number {
    return Date.now() + offsetMs;
  },
  /** Test-only: jump the clock forward. */
  advance(ms: number): void {
    offsetMs += ms;
    listeners.forEach((l) => l());
  },
  /** Test-only: current offset from the real clock. */
  offset(): number {
    return offsetMs;
  },
  /** Test-only */
  reset(): void {
    offsetMs = 0;
    listeners.forEach((l) => l());
  },
  /** Subscribe to test-driven jumps so tickers can recompute immediately. */
  onJump(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
