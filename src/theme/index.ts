import { useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useProfileStore } from '@/stores/profile';

import { palettes, type ColorScheme, type Palette } from './tokens';

export * from './tokens';

export interface Theme {
  scheme: ColorScheme;
  c: Palette;
  isDark: boolean;
}

/** Resolved theme: the user's appearance setting, falling back to the system scheme. */
export function useTheme(): Theme {
  const appearance = useProfileStore((s) => s.settings.appearance);
  const system = useColorScheme();
  const scheme: ColorScheme =
    appearance === 'system' ? (system === 'light' ? 'light' : 'dark') : appearance;
  return { scheme, c: palettes[scheme], isDark: scheme === 'dark' };
}

/** True when the OS "Reduce Motion" setting is on: swap movement for crossfades. */
export function useReduceMotion(): boolean {
  return useReducedMotion();
}
