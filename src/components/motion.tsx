// Ink motion: the few micro-animations that give Unload its feel.
// One language throughout — words settle like fresh ink, lift away like ink in water,
// and touch blooms like a drop on paper. Everything is quiet, short, and honours Reduce Motion.
import { useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { T } from './T';

type TextProps = { variant?: Parameters<typeof T>[0]['variant']; tone?: Parameters<typeof T>[0]['tone']; style?: StyleProp<TextStyle> };

// Stable pseudo-randomness per word, so a dissolve looks the same however often it re-renders.
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const words = (text: string) => text.split(/\s+/).filter(Boolean);

// ---------- Write in ----------

function RisingWord({ word, delay, text }: { word: string; delay: number; text: TextProps }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) p.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [delay, reduced, p]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 10 }],
  }));
  return (
    <Animated.View style={style}>
      <T variant={text.variant} tone={text.tone} style={text.style}>
        {word}{' '}
      </T>
    </Animated.View>
  );
}

// Words arrive one after another and settle onto the page, like ink drying in sequence.
export function WriteIn({
  text,
  delay = 0,
  stagger = 90,
  ...textProps
}: { text: string; delay?: number; stagger?: number } & TextProps) {
  return (
    <View accessible accessibilityLabel={text} style={styles.words}>
      {words(text).map((w, i) => (
        <RisingWord key={`${w}-${i}`} word={w} delay={delay + i * stagger} text={textProps} />
      ))}
    </View>
  );
}

// ---------- Dissolve ----------

const driftOf = (i: number) => {
  const r = rand(i + 1);
  const r2 = rand(i + 101);
  return {
    delay: Math.min(i * 22, 700) + r * 90,
    duration: 950 + r2 * 400,
    dx: (r - 0.5) * 26,
    dy: -(36 + r2 * 54),
    rotate: (r2 - 0.5) * 14,
  };
};

function DriftWord({ word, index, go, text }: { word: string; index: number; go: boolean; text: TextProps }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  const d = driftOf(index);

  useEffect(() => {
    if (!go) return;
    p.value = reduced
      ? withTiming(1, { duration: 250 })
      : withDelay(d.delay, withTiming(1, { duration: d.duration, easing: Easing.out(Easing.cubic) }));
  }, [go, reduced, d.delay, d.duration, p]);

  const style = useAnimatedStyle(() => {
    const t = p.value;
    if (reduced) return { opacity: 1 - t };
    return {
      opacity: interpolate(t, [0, 0.25, 1], [1, 0.6, 0]),
      transform: [
        { translateX: t * d.dx },
        { translateY: t * d.dy },
        { rotate: `${t * d.rotate}deg` },
        { scale: 1 - t * 0.08 },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <T variant={text.variant} tone={text.tone} style={text.style}>
        {word}{' '}
      </T>
    </Animated.View>
  );
}

// Text that, once `go` turns true, lifts off the page word by word and disperses like ink in water.
// `onDone` fires when the last word has gone.
export function Dissolve({
  text,
  go,
  onDone,
  maxWords = 70,
  ...textProps
}: { text: string; go: boolean; onDone?: () => void; maxWords?: number } & TextProps) {
  const reduced = useReducedMotion();
  const all = words(text);
  const shown = all.length > maxWords ? [...all.slice(0, maxWords), '…'] : all;

  useEffect(() => {
    if (!go || !onDone) return;
    const total = reduced
      ? 260
      : Math.max(...shown.map((_, i) => driftOf(i).delay + driftOf(i).duration), 0) + 40;
    const timer = setTimeout(onDone, total);
    return () => clearTimeout(timer);
    // `shown` is derived from `text`; re-running on every render would restart the timer.
  }, [go, reduced, text]);

  return (
    <View accessible accessibilityLabel={text} style={styles.words}>
      {shown.map((w, i) => (
        <DriftWord key={`${w}-${i}`} word={w} index={i} go={go} text={textProps} />
      ))}
    </View>
  );
}

// ---------- Ink press ----------

// A Pressable whose touch spreads like a drop of ink soaking into paper, from where the finger landed.
export function InkPress({
  children,
  style,
  containerStyle,
  inkColor,
  inkOpacity = 0.08,
  onPressIn,
  onPressOut,
  ...props
}: Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // Layout for the outer wrapper (flex, width) when the press sits in a row.
  containerStyle?: StyleProp<ViewStyle>;
  inkColor: string;
  inkOpacity?: number;
}) {
  const reduced = useReducedMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const spread = useSharedValue(0);
  const ink = useSharedValue(0);
  const press = useSharedValue(1);
  const radius = Math.hypot(size.w, size.h);

  const bloom = useAnimatedStyle(() => ({
    left: x.value - radius,
    top: y.value - radius,
    opacity: ink.value * inkOpacity,
    transform: [{ scale: spread.value }],
  }));
  const body = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const down = (e: GestureResponderEvent) => {
    x.value = e.nativeEvent.locationX;
    y.value = e.nativeEvent.locationY;
    ink.value = 1;
    if (reduced) {
      spread.value = 1;
    } else {
      spread.value = 0.02;
      spread.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
      press.value = withTiming(0.985, { duration: 120 });
    }
    onPressIn?.(e);
  };

  const up = (e: GestureResponderEvent) => {
    ink.value = withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) });
    press.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) });
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[containerStyle, body]}>
      <Pressable
        {...props}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        onPressIn={down}
        onPressOut={up}
        style={[style, styles.clip, containerStyle ? styles.fill : null]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bloom,
            { width: radius * 2, height: radius * 2, borderRadius: radius, backgroundColor: inkColor },
            bloom,
          ]}
        />
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  words: { flexDirection: 'row', flexWrap: 'wrap' },
  clip: { overflow: 'hidden' },
  fill: { flexGrow: 1 },
  bloom: { position: 'absolute' },
});
