import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * clearSky line icons: 24-pt grid, 1.6-pt strokes, round joins — drawn to feel
 * like instrument markings. Add new glyphs here rather than pulling in an icon font.
 */
const paths = {
  today: ['M3 17h18', 'M6 17a6 6 0 0 1 12 0', 'M12 5v2', 'M4.9 8.9l1.4 1.4', 'M19.1 8.9l-1.4 1.4'],
  fly: ['M3 13.5l7-1.5 5-7 1.8.5-2.3 6 4.5-1 1.5-1.5 1 .3-1 3.2-17 5z'],
  calm: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z'],
  learn: ['M4 5.5c2.7-1 5.3-1 8 .5 2.7-1.5 5.3-1.5 8-.5V19c-2.7-1-5.3-1-8 .5-2.7-1.5-5.3-1.5-8-.5z', 'M12 6v13.5'],
  settings: [
    'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
    'M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
  ],
  back: ['M15 5l-7 7 7 7'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  chevron: ['M9 5l7 7-7 7'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z', 'M20 20l-4-4'],
  breathe: ['M3 9c3-3 6 3 9 0s6 3 9 0', 'M3 15c3-3 6 3 9 0s6 3 9 0'],
  ground: ['M12 3v12', 'M7 11l5 5 5-5', 'M4 21h16'],
  game: ['M4 4h7v7H4z', 'M13 13h7v7h-7z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z'],
  sound: ['M4 10v4', 'M8 7v10', 'M12 4v16', 'M16 8v8', 'M20 10.5v3'],
  gauge: ['M4 17a8 8 0 1 1 16 0', 'M12 17l4-6', 'M12 17h.01'],
  timeline: ['M4 12h16', 'M6 12v-3', 'M12 12V7', 'M18 12v-3', 'M4 17h16'],
  cloud: ['M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1.3A4.5 4.5 0 0 1 17.5 18z'],
  book: ['M6 3h11a1 1 0 0 1 1 1v16H7a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z', 'M5 18a2 2 0 0 1 2-2h11'],
  steps: ['M4 20h4v-4h4v-4h4V8h4'],
  share: ['M12 15V3', 'M7.5 7.5L12 3l4.5 4.5', 'M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6'],
  heart: ['M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z'],
  shield: ['M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6z'],
  info: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 11v6', 'M12 7.5h.01'],
  refresh: ['M20 11a8 8 0 0 0-14.3-4.3L4 8.5', 'M4 4.5v4h4', 'M4 13a8 8 0 0 0 14.3 4.3l1.7-1.8', 'M20 19.5v-4h-4'],
  clock: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 7v5l3 2'],
  bell: ['M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
  lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  trash: ['M5 7h14', 'M9 7V4h6v3', 'M7 7l1 13h8l1-13'],
  offline: ['M4 4l16 16', 'M8.5 16.5a5 5 0 0 1 7 0', 'M5 13a10 10 0 0 1 4-2.6', 'M19 13a10 10 0 0 0-5-2.9', 'M12 20h.01'],
  log: ['M5 4h14v16H5z', 'M9 9h6', 'M9 13h6', 'M9 17h3'],
  sunrise: ['M3 18h18', 'M7 18a5 5 0 0 1 10 0', 'M12 6v4', 'M9.5 8.5L12 6l2.5 2.5'],
  seat: ['M7 4v9a2 2 0 0 0 2 2h7', 'M16 15v5', 'M9 20h9', 'M7 9h6'],
  pause: ['M8 5v14', 'M16 5v14'],
  play: ['M7 4.5l12 7.5-12 7.5z'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
} as const;

export type IconName = keyof typeof paths | 'dot';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color, strokeWidth = 1.6 }: IconProps) {
  const { c } = useTheme();
  const stroke = color ?? c.text;
  if (name === 'dot') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
        <Circle cx={12} cy={12} r={4} fill={stroke} />
      </Svg>
    );
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {paths[name].map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
