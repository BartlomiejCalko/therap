// The living background behind every screen: a watercolour sky that breathes. A painted wash
// drifts slowly, three soft stains of colour wander, stars twinkle at night and gold dust rises
// at dawn. Touches leave a ring of light; moments that matter (saving a thought, choosing a
// state, finishing a session) scatter a few sparks of gold.
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const PAINTING = require('@/assets/backgrounds/watercolor.jpg');

// ---------- Events ----------

type AtmosEvent = { kind: 'tap' | 'burst'; x?: number; y?: number };
const listeners = new Set<(e: AtmosEvent) => void>();

// Lets any part of the app make the sky react. Only the screen in view is listening.
export const atmosphere = {
  tap: (x: number, y: number) => listeners.forEach((l) => l({ kind: 'tap', x, y })),
  burst: (x?: number, y?: number) => listeners.forEach((l) => l({ kind: 'burst', x, y })),
};

// ---------- Helpers ----------

// A small seeded random, so stars keep their places between renders.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const slow = (ms: number) => ({ duration: ms, easing: Easing.inOut(Easing.sin) });

// ---------- Layers ----------

function Painting({ active, opacity }: { active: boolean; opacity: number }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) return cancelAnimation(t);
    t.value = withRepeat(withTiming(1, slow(26000)), -1, true);
    return () => cancelAnimation(t);
  }, [active, reduced, t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1.12 + t.value * 0.06 }, { translateY: -14 + t.value * 28 }, { rotate: `${-1 + t.value * 2}deg` }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image source={PAINTING} resizeMode="cover" style={[StyleSheet.absoluteFill, { opacity }]} />
    </Animated.View>
  );
}

function Stain({
  color,
  size,
  from,
  to,
  duration,
  active,
  id,
}: {
  color: string;
  size: number;
  from: [number, number];
  to: [number, number];
  duration: number;
  active: boolean;
  id: string;
}) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) return cancelAnimation(t);
    t.value = withRepeat(withTiming(1, slow(duration)), -1, true);
    return () => cancelAnimation(t);
  }, [active, reduced, duration, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: from[0] + (to[0] - from[0]) * t.value },
      { translateY: from[1] + (to[1] - from[1]) * t.value },
      { scale: 0.9 + 0.2 * t.value },
    ],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="0.55" stopColor={color} stopOpacity={0.45} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

// A star that twinkles at night; at dawn the same mote drifts upward like gold dust.
function Mote({
  x,
  y,
  r,
  color,
  delay,
  period,
  rise,
  active,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
  period: number;
  rise: boolean;
  active: boolean;
}) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(t);
      t.value = 0.5;
      return;
    }
    t.value = rise
      ? withDelay(delay, withRepeat(withTiming(1, { duration: period * 3, easing: Easing.linear }), -1, false))
      : withDelay(delay, withRepeat(withSequence(withTiming(1, slow(period)), withTiming(0, slow(period))), -1, false));
    return () => cancelAnimation(t);
  }, [active, reduced, rise, delay, period, t]);
  const style = useAnimatedStyle(() =>
    rise
      ? { opacity: Math.sin(t.value * Math.PI) * 0.8, transform: [{ translateY: -60 * t.value }, { translateX: 8 * Math.sin(t.value * 6) }] }
      : { opacity: 0.15 + 0.85 * t.value, transform: [{ scale: 0.7 + 0.5 * t.value }] },
  );
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: r * 3,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

// ---------- Reactions ----------

type Spark = { id: number; kind: 'tap' | 'burst'; x: number; y: number };

function Ripple({ x, y, color, big }: { x: number; y: number; color: string; big: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: big ? 1200 : 900, easing: Easing.out(Easing.cubic) });
  }, [big, t]);
  const size = big ? 260 : 150;
  const glow = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - t.value), transform: [{ scale: 0.25 + t.value * 0.95 }] }));
  const ring = useAnimatedStyle(() => ({ opacity: 0.9 * (1 - t.value), transform: [{ scale: 0.15 + t.value * 0.85 }] }));
  const box = { position: 'absolute' as const, left: x - size / 2, top: y - size / 2, width: size, height: size };
  return (
    <>
      <Animated.View style={[box, glow]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={`glow-${x}-${y}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color} stopOpacity={0.9} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#glow-${x}-${y})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[box, { borderRadius: size / 2, borderWidth: 1, borderColor: color }, ring]} />
    </>
  );
}

function Burst({ x, y, color }: { x: number; y: number; color: string }) {
  const sparks = useMemo(() => {
    const rand = seeded(Math.round(x * 7 + y * 13) + 1);
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2 + rand() * 0.4,
      dist: 46 + rand() * 70,
      r: 1.6 + rand() * 1.8,
    }));
  }, [x, y]);
  return (
    <>
      {sparks.map((s, i) => (
        <SparkDot key={i} x={x} y={y} {...s} color={color} />
      ))}
    </>
  );
}

function SparkDot({ x, y, angle, dist, r, color }: { x: number; y: number; angle: number; dist: number; r: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) });
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85,
    transform: [
      { translateX: Math.cos(angle) * dist * t.value },
      // A little lift, as if the sparks were lighter than air.
      { translateY: Math.sin(angle) * dist * t.value - 24 * t.value * t.value },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

// ---------- The sky ----------

export function Atmosphere() {
  const { c, scheme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const nextId = useRef(0);
  const night = scheme === 'dark';

  // Only the screen in view keeps its sky moving and listens for touches.
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      const listen = (e: AtmosEvent) => {
        const id = nextId.current++;
        const spark: Spark = { id, kind: e.kind, x: e.x ?? width / 2, y: e.y ?? height * 0.42 };
        setSparks((s) => [...s.slice(-5), spark]);
        setTimeout(() => setSparks((s) => s.filter((x) => x.id !== id)), 1400);
      };
      listeners.add(listen);
      return () => {
        listeners.delete(listen);
        setActive(false);
      };
    }, [width, height]),
  );

  const motes = useMemo(() => {
    const rand = seeded(night ? 7 : 11);
    return Array.from({ length: night ? 34 : 18 }, (_, i) => ({
      key: i,
      x: rand() * width,
      y: rand() * height,
      r: night ? 0.6 + rand() * 1.1 : 1 + rand() * 1.4,
      delay: Math.round(rand() * 4000),
      period: 1800 + Math.round(rand() * 3200),
    }));
  }, [night, width, height]);

  const stain = Math.max(width, height) * 0.9;

  return (
    // Clipped to the screen: the painting is drawn larger than it so it can drift.
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.sky[0]} />
            <Stop offset="0.55" stopColor={c.sky[1]} />
            <Stop offset="1" stopColor={c.sky[2]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#sky)" />
      </Svg>
      <Painting active={active} opacity={c.paintOpacity} />
      <Stain id="stain-a" color={c.stains[0]} size={stain} from={[-stain * 0.45, -stain * 0.3]} to={[-stain * 0.2, -stain * 0.12]} duration={19000} active={active} />
      <Stain id="stain-b" color={c.stains[1]} size={stain * 0.8} from={[width - stain * 0.5, height * 0.35]} to={[width - stain * 0.7, height * 0.2]} duration={23000} active={active} />
      <Stain id="stain-c" color={c.stains[2]} size={stain * 0.9} from={[-stain * 0.3, height - stain * 0.45]} to={[-stain * 0.05, height - stain * 0.6]} duration={27000} active={active} />
      {motes.map(({ key, ...m }) => (
        <Mote key={key} {...m} color={c.star} rise={!night} active={active} />
      ))}
      {sparks.map((s) =>
        s.kind === 'burst' ? (
          <View key={s.id} style={StyleSheet.absoluteFill}>
            <Ripple x={s.x} y={s.y} color={c.gold} big />
            <Burst x={s.x} y={s.y} color={c.gold} />
          </View>
        ) : (
          <Ripple key={s.id} x={s.x} y={s.y} color={night ? c.star : c.gold} big={false} />
        ),
      )}
    </View>
  );
}
