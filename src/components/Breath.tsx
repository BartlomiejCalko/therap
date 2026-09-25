import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PHASE_LABEL, type BreathPattern } from '@/content/copy';
import { soft } from '@/lib/haptics';
import { useTheme } from '@/theme/theme';

import { T } from './T';

const SMALL = 0.42;

export function useBreath(pattern: BreathPattern, running: boolean) {
  const scale = useSharedValue(SMALL);
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [cycles, setCycles] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!running) {
      cancelAnimation(scale);
      scale.value = withTiming(SMALL, { duration: 900, easing: Easing.inOut(Easing.sin) });
      setPhaseIndex(-1);
      setCycles(0);
      return;
    }

    const run = (i: number) => {
      const phase = pattern.phases[i];
      setPhaseIndex(i);
      if (i === 0) setCycles((n) => n + 1);
      soft();
      const ms = phase.seconds * 1000;
      if (phase.kind === 'in') scale.value = withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) });
      if (phase.kind === 'out') scale.value = withTiming(SMALL, { duration: ms, easing: Easing.inOut(Easing.sin) });
      timer.current = setTimeout(() => run((i + 1) % pattern.phases.length), ms);
    };
    run(0);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [running, pattern, scale]);

  const phase = phaseIndex >= 0 ? pattern.phases[phaseIndex] : null;
  return { scale, phase, cycles };
}

export function BreathCircle({
  pattern,
  running,
  size = 280,
  idleLabel = 'Ready when you are',
}: {
  pattern: BreathPattern;
  running: boolean;
  size?: number;
  idleLabel?: string;
}) {
  const { c } = useTheme();
  const { scale, phase } = useBreath(pattern, running);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: size / 2, borderWidth: StyleSheet.hairlineWidth, borderColor: c.hairline },
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c.surfaceAlt,
            borderWidth: 1,
            borderColor: c.inkFaint,
          },
          animated,
        ]}
      />
      <T variant="italic" tone={phase ? 'ink' : 'soft'} center style={{ fontSize: 22 }}>
        {phase ? PHASE_LABEL[phase.kind] : idleLabel}
      </T>
    </View>
  );
}
