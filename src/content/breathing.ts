/**
 * Breathing patterns — shared by the onboarding demo (stream A) and the Calm
 * tools (stream B). Pure data + pure timing maths: no React, no clock.
 *
 * Clinical guardrails (binding): no 4-7-8, no long breath holds as a panic tool,
 * never "take deep breaths". The default is a gentle extended exhale.
 */

export type BreathPhaseKind = 'in' | 'hold' | 'out' | 'rest' | 'topUp';

export interface BreathPhase {
  kind: BreathPhaseKind;
  /** Milliseconds */
  ms: number;
  /** On-screen and spoken cue, second person, short */
  cue: string;
  /** Ring size at the END of this phase, 0 = lungs empty, 1 = full */
  to: number;
}

export interface BreathPattern {
  id: string;
  name: string;
  /** One line under the name */
  summary: string;
  /** Why/when to use it, shown in the picker */
  detail: string;
  phases: BreathPhase[];
  /** Panic-safe = no holds; used by SOS */
  panicSafe: boolean;
}

const s = (sec: number) => Math.round(sec * 1000);

export const BREATHING_PATTERNS: BreathPattern[] = [
  {
    id: 'extended-exhale',
    name: 'Longer out-breath',
    summary: 'In for 4, out for 6',
    detail:
      'Breathing out for longer than you breathe in is one of the quickest ways to settle a racing heart. Gentle, not deep.',
    panicSafe: true,
    phases: [
      { kind: 'in', ms: s(4), cue: 'Breathe in gently', to: 1 },
      { kind: 'out', ms: s(6), cue: 'And slowly out', to: 0 },
    ],
  },
  {
    id: 'coherent',
    name: 'Even breathing',
    summary: 'In for 5, out for 5',
    detail: 'A steady, even rhythm of about six breaths a minute. Good for longer stretches of cruise.',
    panicSafe: true,
    phases: [
      { kind: 'in', ms: s(5), cue: 'Breathe in', to: 1 },
      { kind: 'out', ms: s(5), cue: 'Breathe out', to: 0 },
    ],
  },
  {
    id: 'box',
    name: 'Box breathing',
    summary: 'In 4, hold 4, out 4, hold 4',
    detail:
      'A counting pattern that gives a busy mind something to hold on to. Best for focus before boarding, not in the middle of a panic.',
    panicSafe: false,
    phases: [
      { kind: 'in', ms: s(4), cue: 'Breathe in', to: 1 },
      { kind: 'hold', ms: s(4), cue: 'Hold softly', to: 1 },
      { kind: 'out', ms: s(4), cue: 'Breathe out', to: 0 },
      { kind: 'rest', ms: s(4), cue: 'Rest', to: 0 },
    ],
  },
  {
    id: 'sigh',
    name: 'Double-inhale sigh',
    summary: 'Two breaths in through the nose, one long sigh out',
    detail:
      'A breath in, a small top-up breath, then a long, slow sigh out. A few rounds can take the edge off quickly.',
    panicSafe: true,
    phases: [
      { kind: 'in', ms: s(2.5), cue: 'Breathe in through your nose', to: 0.8 },
      { kind: 'topUp', ms: s(1), cue: 'A little more', to: 1 },
      { kind: 'out', ms: s(6.5), cue: 'Long sigh out', to: 0 },
    ],
  },
];

export const DEFAULT_PATTERN_ID = 'extended-exhale';

export function getPattern(id: string | null | undefined): BreathPattern {
  return BREATHING_PATTERNS.find((p) => p.id === id) ?? BREATHING_PATTERNS[0];
}

export function cycleMs(p: BreathPattern): number {
  return p.phases.reduce((t, ph) => t + ph.ms, 0);
}

export interface PhaseState {
  /** Index into pattern.phases */
  index: number;
  phase: BreathPhase;
  /** Completed full cycles */
  cycle: number;
  /** Elapsed ms (since start) at which this phase began / will end */
  phaseStartMs: number;
  phaseEndMs: number;
  /** Ring size at the start of the phase */
  from: number;
  /** 0..1 progress through the phase */
  t: number;
}

/** Where in the pattern we are after `elapsedMs`. Pure and drift-free. */
export function phaseAt(p: BreathPattern, elapsedMs: number): PhaseState {
  const total = cycleMs(p);
  const e = Math.max(0, elapsedMs);
  const cycle = Math.floor(e / total);
  let within = e - cycle * total;
  let start = cycle * total;
  for (let i = 0; i < p.phases.length; i++) {
    const ph = p.phases[i];
    if (within < ph.ms || i === p.phases.length - 1) {
      const prev = p.phases[(i - 1 + p.phases.length) % p.phases.length];
      return {
        index: i,
        phase: ph,
        cycle,
        phaseStartMs: start,
        phaseEndMs: start + ph.ms,
        from: prev.to,
        t: Math.min(1, within / ph.ms),
      };
    }
    within -= ph.ms;
    start += ph.ms;
  }
  // Unreachable, keeps TypeScript happy.
  const ph = p.phases[0];
  return { index: 0, phase: ph, cycle, phaseStartMs: start, phaseEndMs: start + ph.ms, from: 0, t: 0 };
}

/** Ring size (0..1) at `elapsedMs`, eased like a natural breath. */
export function ringSizeAt(p: BreathPattern, elapsedMs: number): number {
  const st = phaseAt(p, elapsedMs);
  const eased = 0.5 - Math.cos(Math.PI * st.t) / 2;
  return st.from + (st.phase.to - st.from) * eased;
}
