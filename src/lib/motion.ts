import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Accelerometer service for the G-meter.
 *
 * Samples are in g (1 g = gravity). `magnitude` is what a passenger "feels":
 * 1.0 in smooth, level flight or sitting on the ground.
 *
 * Tests (and the labelled demo mode) can inject samples with `motion.inject`.
 */

export interface MotionSample {
  x: number;
  y: number;
  z: number;
  /** sqrt(x² + y² + z²), in g */
  magnitude: number;
  /** Epoch ms */
  t: number;
}

export type MotionAvailability = 'available' | 'unavailable';

type Listener = (s: MotionSample) => void;

const injectedListeners = new Set<Listener>();

function toSample(x: number, y: number, z: number, t: number): MotionSample {
  return { x, y, z, magnitude: Math.sqrt(x * x + y * y + z * z), t };
}

export const motion = {
  async availability(): Promise<MotionAvailability> {
    try {
      // On web the API may exist but never deliver data without a user-granted permission.
      if (Platform.OS === 'web') return 'unavailable';
      return (await Accelerometer.isAvailableAsync()) ? 'available' : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },

  /**
   * Subscribe to samples at roughly `hz` per second. Returns an unsubscribe function.
   * Always delivers injected samples; delivers real ones only where a sensor exists.
   */
  subscribe(listener: Listener, hz = 20): () => void {
    injectedListeners.add(listener);
    let remove: (() => void) | null = null;
    if (Platform.OS !== 'web') {
      try {
        Accelerometer.setUpdateInterval(Math.max(16, Math.round(1000 / hz)));
        const sub = Accelerometer.addListener(({ x, y, z }) => {
          listener(toSample(x, y, z, Date.now()));
        });
        remove = () => sub.remove();
      } catch {
        remove = null;
      }
    }
    return () => {
      injectedListeners.delete(listener);
      remove?.();
    };
  },

  /** Deliver synthetic samples to all subscribers (tests and demo mode). */
  inject(samples: { x: number; y: number; z: number; t?: number }[]): void {
    for (const s of samples) {
      const sample = toSample(s.x, s.y, s.z, s.t ?? Date.now());
      injectedListeners.forEach((l) => l(sample));
    }
  },
};
