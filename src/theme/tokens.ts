/**
 * clearSky design tokens — "Dusk at altitude".
 * Instrument-panel calm: warm horizon amber over deep blue-green ink.
 * Every text/background pair used by the UI primitives is contrast-checked
 * by `npm run check:contrast` (scripts/check-contrast.mjs) — update both together.
 */

export type ColorScheme = 'dark' | 'light';

export interface Palette {
  /** App background */
  bg: string;
  /** Cards, sheets */
  surface: string;
  /** Raised / pressed surfaces, input fills */
  raised: string;
  /** Hairlines and outlines */
  line: string;
  /** Primary text */
  text: string;
  /** Secondary text (>= 4.5:1 on bg and surface) */
  textSecondary: string;
  /** Tertiary text for large/decorative labels only (>= 3:1) */
  textTertiary: string;
  /** Horizon: the single brand accent (CTAs, key numerals) */
  horizon: string;
  /** Text/icon colour on top of `horizon` fills */
  onHorizon: string;
  /** Sea-glass: calm / positive / breathing */
  calm: string;
  onCalm: string;
  /** Ember: attention. Never used to mean "danger". */
  ember: string;
  /** Scrim behind modals */
  scrim: string;
  /** Sky gradient stops, top -> bottom, for hero backgrounds */
  sky: readonly [string, string, string];
}

export const palettes: Record<ColorScheme, Palette> = {
  dark: {
    bg: '#0B1418',
    surface: '#14222A',
    raised: '#1D303A',
    line: '#2A414C',
    text: '#EEF3F1',
    textSecondary: '#A9BBC0',
    textTertiary: '#7E949B',
    horizon: '#F2B872',
    onHorizon: '#1A1206',
    calm: '#7FCFC0',
    onCalm: '#06201C',
    ember: '#EE9A80',
    scrim: 'rgba(4, 9, 12, 0.72)',
    sky: ['#0B1418', '#12262F', '#2B3A3F'],
  },
  light: {
    bg: '#F6F2EA',
    surface: '#FFFFFF',
    raised: '#ECE6DA',
    line: '#D9D1C1',
    text: '#12202A',
    textSecondary: '#4B5D64',
    textTertiary: '#66777D',
    horizon: '#9A5410',
    onHorizon: '#FFFFFF',
    calm: '#1A7166',
    onCalm: '#FFFFFF',
    ember: '#A8482F',
    scrim: 'rgba(18, 32, 42, 0.45)',
    sky: ['#F6F2EA', '#F3E7D3', '#EBD3B0'],
  },
};

/** 4-pt spacing scale */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Font family names registered in src/theme/fonts.ts */
export const fonts = {
  display: 'Fraunces_500Medium',
  displaySemi: 'Fraunces_600SemiBold',
  /** undefined = platform system font (SF Pro on iOS) */
  body: undefined as string | undefined,
} as const;

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'caption'
  | 'label'
  | 'numeral';

export interface TypeStyle {
  fontFamily?: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontWeight?: '400' | '500' | '600' | '700';
  textTransform?: 'uppercase';
  fontVariant?: 'tabular-nums'[];
}

export const type: Record<TextVariant, TypeStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.6 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: fonts.displaySemi, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 25, fontWeight: '400' },
  bodyStrong: { fontSize: 17, lineHeight: 25, fontWeight: '600' },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  numeral: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
};

/** Motion: slow, interruptible, no bounce. Nothing moves faster than a breath. */
export const motion = {
  quick: 180,
  base: 320,
  slow: 600,
  breath: 4000,
  /** Reanimated spring config: critically damped, no overshoot */
  spring: { damping: 26, stiffness: 180, mass: 1 },
} as const;

/** Minimum touch targets (pt) */
export const hit = { min: 44, sos: 56 } as const;

/** Max content width so the web build and iPad stay readable */
export const layout = { maxWidth: 560, gutter: 20 } as const;
