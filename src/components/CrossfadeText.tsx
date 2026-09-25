import { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { T } from './T';

const OUT_MS = 350;

// Fades the old line out before the new one fades in, so two phrases never overlap.
export function CrossfadeText({ text }: { text: string | null }) {
  const [shown, setShown] = useState(text);
  const opacity = useSharedValue(text ? 1 : 0);

  useEffect(() => {
    if (text === shown) return;
    opacity.value = withTiming(0, { duration: OUT_MS });
    const t = setTimeout(() => {
      setShown(text);
      if (text) opacity.value = withTiming(1, { duration: 900 });
    }, OUT_MS);
    return () => clearTimeout(t);
  }, [text, shown, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <T variant="italic" tone="soft" center style={{ fontSize: 17 }}>
        {shown ?? ' '}
      </T>
    </Animated.View>
  );
}
