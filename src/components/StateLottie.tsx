import LottieView, { type AnimationObject } from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import type { CheckinState } from '@/content/copy';
import { useSettled } from '@/lib/useSettled';

// The four states of mind as living watercolours: each a short loop painted for the app.
const SOURCES: Record<CheckinState, AnimationObject> = {
  'too-much': require('@/assets/lottie/01-za-duzo-naraz.json'),
  scattered: require('@/assets/lottie/02-mysli-sie-rozbiegaja.json'),
  stuck: require('@/assets/lottie/03-stoje-w-miejscu.json'),
  weighing: require('@/assets/lottie/04-cos-mi-ciazy.json'),
};

// The painting is built together with its screen (before the transition starts, never in the
// middle of it) and shown still; it starts to move once the transition is over, and rests again
// when the screen is left. One picture throughout, so its colours never change under the eye.
export function StateLottie({
  state,
  size,
  playing = true,
  speed = 1,
  style,
}: {
  state: CheckinState;
  size: number;
  playing?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<LottieView>(null);
  const reduced = useReducedMotion();
  const settled = useSettled();
  const play = playing && settled && !reduced;

  useEffect(() => {
    if (play) ref.current?.play();
    else ref.current?.pause();
  }, [play]);

  return (
    <Animated.View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={ref}
        source={SOURCES[state]}
        autoPlay={false}
        loop
        speed={speed}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </Animated.View>
  );
}
