import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion, radius, useReduceMotion, useTheme } from '@/theme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  testID?: string;
  /** Spoken, e.g. "Step 3 of 13" */
  accessibilityLabel?: string;
  tone?: 'horizon' | 'calm';
}

export function ProgressBar({ value, testID, accessibilityLabel, tone = 'horizon' }: ProgressBarProps) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const w = useSharedValue(v);

  useEffect(() => {
    w.value = reduce ? v : withTiming(v, { duration: motion.base });
  }, [v, reduce, w]);

  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={[styles.track, { backgroundColor: c.raised }]}>
      <Animated.View style={[styles.fill, { backgroundColor: tone === 'calm' ? c.calm : c.horizon }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: radius.pill, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: radius.pill },
});
