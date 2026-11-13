import { useEffect, useId } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { PhaseState } from '@/content/breathing';
import { clock } from '@/lib/clock';
import { space, useReduceMotion, useTheme } from '@/theme';

import { Text } from './Text';

export interface BreathRingProps {
  /** From useBreathPacer; null = idle (ring rests half-open) */
  state: PhaseState | null;
  /** Wall-clock start of the exercise (needed to time the current phase) */
  startedAt: number | null;
  size?: number;
  /** Show the cue under the ring (default true) */
  showCue?: boolean;
  /** Announce each phase to VoiceOver */
  announce?: boolean;
  testID?: string;
}

const MIN = 0.42;

/**
 * The breathing visual: a soft disc that fills on the in-breath and empties on
 * the out-breath, paced from the wall clock. Under Reduce Motion the disc
 * brightens and dims instead of changing size.
 */
export function BreathRing({ state, startedAt, size = 260, showCue = true, announce = true, testID }: BreathRingProps) {
  const { c } = useTheme();
  const reduce = useReduceMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const level = useSharedValue(0.5);

  const key = state ? `${state.cycle}:${state.index}` : 'idle';

  useEffect(() => {
    if (!state || startedAt == null) {
      level.value = withTiming(0.5, { duration: 800 });
      return;
    }
    const remaining = Math.max(50, startedAt + state.phaseEndMs - clock.now());
    level.value = withTiming(state.phase.to, {
      duration: remaining,
      easing: Easing.inOut(Easing.sin),
    });
    if (announce) AccessibilityInfo.announceForAccessibility(state.phase.cue);
    // `key` changes exactly once per phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, startedAt]);

  const discStyle = useAnimatedStyle(() => {
    const scale = MIN + (1 - MIN) * level.value;
    return reduce
      ? { opacity: 0.45 + 0.55 * level.value, transform: [{ scale: 0.8 }] }
      : { opacity: 1, transform: [{ scale }] };
  });

  const cue = state?.phase.cue ?? 'Ready when you are';

  return (
    <View testID={testID} style={styles.wrap}>
      <View
        style={{ width: size, height: size }}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Breathing guide"
        accessibilityValue={{ text: cue }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 1.5} stroke={c.line} strokeWidth={1.5} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) * MIN}
            stroke={c.line}
            strokeWidth={1}
            strokeDasharray="2 6"
            fill="none"
          />
        </Svg>
        <Animated.View style={[StyleSheet.absoluteFill, discStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id={`br${uid}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={c.calm} stopOpacity={0.95} />
                <Stop offset="0.7" stopColor={c.calm} stopOpacity={0.55} />
                <Stop offset="1" stopColor={c.calm} stopOpacity={0.12} />
              </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill={`url(#br${uid})`} />
          </Svg>
        </Animated.View>
      </View>
      {showCue ? (
        <Text
          testID={testID ? `${testID}.cue` : undefined}
          variant="title"
          align="center"
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={styles.cue}>
          {cue}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.xl },
  cue: { minHeight: 60 },
});
