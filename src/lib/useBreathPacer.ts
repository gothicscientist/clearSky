import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { phaseAt, type BreathPattern, type PhaseState } from '@/content/breathing';

import { clock } from './clock';
import { haptic } from './haptics';

export interface BreathPacerOptions {
  pattern: BreathPattern;
  /** Wall-clock epoch ms the exercise started, or null when not running */
  startedAt: number | null;
  /** Fire the breathing haptics (soft ramp on inhale, a tick on hold, nothing on exhale) */
  haptics?: boolean;
  /** Called once at the start of every phase (for voice cues) */
  onPhase?: (state: PhaseState) => void;
}

export interface BreathPacer {
  state: PhaseState | null;
  /** Whole seconds since start (wall clock), 0 when stopped */
  elapsedSec: number;
}

/**
 * Drives a breathing exercise from the wall clock: re-renders only at phase
 * boundaries (and once a second for the elapsed counter), never drifts, and
 * recovers the right phase after backgrounding or a test clock jump.
 */
export function useBreathPacer({ pattern, startedAt, haptics = true, onPhase }: BreathPacerOptions): BreathPacer {
  const [state, setState] = useState<PhaseState | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const lastKey = useRef<string>('');
  const onPhaseRef = useRef(onPhase);
  useEffect(() => {
    onPhaseRef.current = onPhase;
  });

  useEffect(() => {
    lastKey.current = '';
    if (startedAt == null) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const rampTimers: ReturnType<typeof setTimeout>[] = [];
    let alive = true;

    const clearRamp = () => {
      rampTimers.splice(0).forEach(clearTimeout);
    };

    const tick = () => {
      if (!alive) return;
      const elapsed = clock.now() - startedAt;
      const st = phaseAt(pattern, elapsed);
      const key = `${st.cycle}:${st.index}`;
      setElapsedSec(Math.floor(elapsed / 1000));
      if (key !== lastKey.current) {
        lastKey.current = key;
        setState(st);
        onPhaseRef.current?.(st);
        clearRamp();
        if (haptics) {
          if (st.phase.kind === 'in' || st.phase.kind === 'topUp') {
            // Soft ramp: a few gentle pulses spread across the inhale.
            const remaining = st.phaseEndMs - elapsed;
            const pulses = st.phase.kind === 'topUp' ? 1 : 3;
            for (let i = 0; i < pulses; i++) {
              const at = (remaining / pulses) * i;
              rampTimers.push(setTimeout(() => alive && haptic(i === pulses - 1 ? 'firm' : 'soft'), at));
            }
          } else if (st.phase.kind === 'hold') {
            haptic('select');
          }
        }
      }
      const untilBoundary = st.phaseEndMs - elapsed;
      const untilSecond = 1000 - (elapsed % 1000);
      timer = setTimeout(tick, Math.max(16, Math.min(untilBoundary, untilSecond)));
    };

    tick();
    const offJump = clock.onJump(() => {
      if (timer) clearTimeout(timer);
      tick();
    });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        if (timer) clearTimeout(timer);
        tick();
      }
    });
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      clearRamp();
      offJump();
      sub.remove();
    };
  }, [pattern, startedAt, haptics]);

  // Derived, so stopping never needs a state reset inside an effect.
  if (startedAt == null) return { state: null, elapsedSec: 0 };
  return { state, elapsedSec };
}
