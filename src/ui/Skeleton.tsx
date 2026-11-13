import { useEffect } from 'react';
import { type DimensionValue, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { radius, useReduceMotion, useTheme } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  testID?: string;
  rounded?: boolean;
}

/** Loading placeholder with a slow breathing pulse (static under Reduce Motion). */
export function Skeleton({ width = '100%', height = 18, testID, rounded }: SkeletonProps) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const o = useSharedValue(0.55);

  useEffect(() => {
    if (reduce) {
      o.value = 0.6;
      return;
    }
    o.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(o);
  }, [reduce, o]);

  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.base,
        { width, height, backgroundColor: c.raised, borderRadius: rounded ? radius.pill : radius.sm },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({ base: {} });
