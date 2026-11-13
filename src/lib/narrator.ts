import * as Speech from 'expo-speech';

import { useProfileStore } from '@/stores/profile';

/**
 * Spoken guidance using the device's built-in voice. Works offline, needs no
 * bundled audio, always optional (Settings -> Voice) and never the only cue:
 * every spoken line is also on screen.
 */

export interface SpeakOptions {
  /** Speak even if another line is in progress (default: interrupt). */
  queue?: boolean;
  onDone?: () => void;
}

/** Last lines requested, for e2e assertions. */
export const narratorLog: string[] = [];

export const narrator = {
  speak(text: string, options: SpeakOptions = {}): void {
    if (!useProfileStore.getState().settings.voice) {
      options.onDone?.();
      return;
    }
    if (narratorLog.length > 100) narratorLog.splice(0, 50);
    narratorLog.push(text);
    try {
      if (!options.queue) void Speech.stop().catch(() => {});
      Speech.speak(text, {
        language: 'en-US',
        // Slightly slower and lower than default reads as calmer.
        rate: 0.88,
        pitch: 0.95,
        onDone: options.onDone,
        onStopped: options.onDone,
        onError: options.onDone,
      });
    } catch {
      options.onDone?.();
    }
  },
  stop(): void {
    try {
      void Speech.stop().catch(() => {});
    } catch {
      // ignore
    }
  },
};
