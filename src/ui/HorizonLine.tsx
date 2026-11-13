import { useEffect, useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useReduceMotion, useTheme } from '@/theme';

export interface HorizonLineProps {
  /** Current tilt in degrees; animates to it. 0 = level. */
  tilt?: number;
  /** Duration of the move to `tilt`, ms */
  duration?: number;
  /** Line thickness */
  weight?: number;
  /** 0..1 glow under the line (the "sunrise" wash) */
  glow?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The recurring clearSky motif: a thin horizon line that levels as you settle.
 * Decorative only — hidden from screen readers. Under Reduce Motion it jumps
 * to its target without movement.
 */
export function HorizonLine({ tilt = 0, duration = 1600, weight = 2, glow = 0, testID, style }: HorizonLineProps) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const angle = useSharedValue(tilt);
  const glowV = useSharedValue(glow);

  useEffect(() => {
    angle.value = reduce ? tilt : withTiming(tilt, { duration, easing: Easing.inOut(Easing.cubic) });
  }, [tilt, duration, reduce, angle]);

  useEffect(() => {
    glowV.value = reduce ? glow : withTiming(glow, { duration: duration * 1.2 });
  }, [glow, duration, reduce, glowV]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowV.value }));

  return (
    <View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, style]}>
      <Animated.View style={[styles.glow, glowStyle]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={`hzg${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.horizon} stopOpacity={0.28} />
              <Stop offset="1" stopColor={c.horizon} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill={`url(#hzg${uid})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.lineWrap, lineStyle]}>
        <Svg width="100%" height={weight} preserveAspectRatio="none" viewBox="0 0 100 2">
          <Defs>
            <LinearGradient id={`hzl${uid}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={c.horizon} stopOpacity={0} />
              <Stop offset="0.2" stopColor={c.horizon} stopOpacity={0.9} />
              <Stop offset="0.8" stopColor={c.horizon} stopOpacity={0.9} />
              <Stop offset="1" stopColor={c.horizon} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="2" fill={`url(#hzl${uid})`} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', height: 120, justifyContent: 'center', overflow: 'visible' },
  lineWrap: { width: '110%', alignSelf: 'center' },
  glow: { position: 'absolute', left: 0, right: 0, top: 60, height: 60 },
});
