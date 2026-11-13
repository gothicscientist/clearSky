import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { type, useTheme, type Palette, type TextVariant } from '@/theme';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'horizon' | 'calm' | 'ember' | 'onHorizon' | 'onCalm';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: Tone;
  align?: TextStyle['textAlign'];
  /** Cap Dynamic Type growth for layout-critical text (instrument numerals). Default 1.6. */
  maxScale?: number;
}

const toneColor = (c: Palette, tone: Tone): string => {
  switch (tone) {
    case 'secondary':
      return c.textSecondary;
    case 'tertiary':
      return c.textTertiary;
    case 'horizon':
      return c.horizon;
    case 'calm':
      return c.calm;
    case 'ember':
      return c.ember;
    case 'onHorizon':
      return c.onHorizon;
    case 'onCalm':
      return c.onCalm;
    default:
      return c.text;
  }
};

/** Themed text. Always use this instead of react-native's Text so type and colour stay on-system. */
export function Text({
  variant = 'body',
  tone = 'primary',
  align,
  style,
  maxScale = 1.6,
  ...rest
}: TextProps) {
  const { c } = useTheme();
  const isHeading = variant === 'hero' || variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : rest.accessibilityRole}
      maxFontSizeMultiplier={maxScale}
      {...rest}
      style={[type[variant] as TextStyle, { color: toneColor(c, tone), textAlign: align }, style]}
    />
  );
}
