import { Fraunces_500Medium, Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';

/**
 * Fraunces (SIL Open Font License) for display type and instrument numerals.
 * Body text uses the platform system font. Keys must match `fonts` in tokens.ts.
 */
export const fontMap = {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
};

/** Loads the display fonts. Resolves to true on error too: the app falls back to system type. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(fontMap);
  return loaded || !!error;
}
