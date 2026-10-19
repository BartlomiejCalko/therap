import LottieView, { type AnimationObject } from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { CheckinState } from '@/content/copy';

// The four states of mind as living watercolours: each a short loop painted for the app.
const SOURCES: Record<CheckinState, AnimationObject> = {
  'too-much': require('@/assets/lottie/01-za-duzo-naraz.json'),
  scattered: require('@/assets/lottie/02-mysli-sie-rozbiegaja.json'),
  stuck: require('@/assets/lottie/03-stoje-w-miejscu.json'),
  weighing: require('@/assets/lottie/04-cos-mi-ciazy.json'),
};

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
  const play = playing && !reduced;

  useEffect(() => {
    if (play) ref.current?.play();
    else ref.current?.pause();
  }, [play]);

  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={ref}
        source={SOURCES[state]}
        autoPlay={play}
        loop
        speed={speed}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
}
