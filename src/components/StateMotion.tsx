// One short scene per state of mind, shown above the check-in question.
// Each starts at once, settles within three seconds and then holds still.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { CheckinState } from '@/content/copy';
import { useTheme } from '@/theme/theme';

import { stateTone } from './StateArt';

const W = 240;
const H = 150;
const STROKE = 1.4;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// Runs `animate` once on mount; with reduced motion the scene simply appears finished.
function useProgress(animate: (v: SharedValue<number>) => void) {
  const reduced = useReducedMotion();
  const v = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) animate(v);
    // Runs once: each scene plays a single time.
  }, []);
  return v;
}

const SETTLE = { damping: 16, stiffness: 120, mass: 0.9 };

// A circle that travels from `from` to `to` on a spring.
function Mover({
  from,
  to,
  r,
  delay,
  fill,
}: {
  from: [number, number];
  to: [number, number];
  r: number;
  delay: number;
  fill: string;
}) {
  const { c } = useTheme();
  const p = useProgress((v) => {
    v.value = withDelay(delay, withSpring(1, SETTLE));
  });
  const props = useAnimatedProps(() => ({
    cx: from[0] + (to[0] - from[0]) * p.value,
    cy: from[1] + (to[1] - from[1]) * p.value,
  }));
  return <AnimatedCircle animatedProps={props} r={r} fill={fill} stroke={c.ink} strokeWidth={STROKE} />;
}

// Too much at once: circles of every size crowd in from all sides and freeze in a heap.
const CROWD: { from: [number, number]; to: [number, number]; r: number }[] = [
  { from: [-40, 30], to: [104, 86], r: 24 },
  { from: [280, 120], to: [140, 80], r: 20 },
  { from: [120, -40], to: [122, 52], r: 15 },
  { from: [-30, 160], to: [86, 112], r: 14 },
  { from: [290, 20], to: [160, 112], r: 16 },
  { from: [200, 190], to: [124, 116], r: 11 },
  { from: [-20, 90], to: [76, 70], r: 10 },
  { from: [260, 70], to: [170, 60], r: 9 },
  { from: [60, -30], to: [96, 44], r: 7 },
  { from: [190, -30], to: [150, 40], r: 6 },
];

function TooMuch({ tone }: { tone: string }) {
  return (
    <>
      {CROWD.map((d, i) => (
        <Mover key={i} {...d} delay={i * 90} fill={tone} />
      ))}
    </>
  );
}

// Scattered: everything starts gathered and flies apart, a few threads left behind.
const SPARKS: { to: [number, number]; r: number }[] = [
  { to: [40, 30], r: 5 },
  { to: [200, 24], r: 4 },
  { to: [214, 112], r: 6 },
  { to: [30, 118], r: 4 },
  { to: [120, 14], r: 3 },
  { to: [126, 138], r: 3.5 },
  { to: [74, 70], r: 3 },
  { to: [176, 70], r: 4.5 },
];

function Thread({ to, delay }: { to: [number, number]; delay: number }) {
  const { c } = useTheme();
  const p = useProgress((v) => {
    v.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  });
  // A thread from the centre that follows its dot about halfway, then thins out.
  const props = useAnimatedProps(() => ({
    x2: W / 2 + (to[0] - W / 2) * 0.55 * p.value,
    y2: H / 2 + (to[1] - H / 2) * 0.55 * p.value,
    opacity: interpolate(p.value, [0, 0.4, 1], [0, 0.5, 0.35]),
  }));
  return <AnimatedLine animatedProps={props} x1={W / 2} y1={H / 2} stroke={c.ink} strokeWidth={1} />;
}

function Scattered({ tone }: { tone: string }) {
  const { c } = useTheme();
  return (
    <>
      {SPARKS.slice(0, 4).map((s, i) => (
        <Thread key={`t${i}`} to={s.to} delay={i * 60} />
      ))}
      {SPARKS.map((s, i) => (
        <Mover key={i} from={[W / 2, H / 2]} to={s.to} r={s.r} delay={i * 60} fill={tone} />
      ))}
      <Circle cx={W / 2} cy={H / 2} r={4} fill={c.ink} />
    </>
  );
}

// Stuck: a stone rolls in, meets a wall, recoils once and stays put.
function Stuck({ tone }: { tone: string }) {
  const { c } = useTheme();
  const ground = 116;
  const r = 20;
  const wall = 168;
  const x = useProgress((v) => {
    v.value = withSequence(
      withTiming(1, { duration: 1100, easing: Easing.in(Easing.quad) }),
      withTiming(0.9, { duration: 260, easing: Easing.out(Easing.quad) }),
      withTiming(0.94, { duration: 420, easing: Easing.inOut(Easing.quad) }),
    );
  });
  const props = useAnimatedProps(() => ({ cx: -r + wall * x.value }));
  return (
    <>
      <Line x1={14} y1={ground} x2={226} y2={ground} stroke={c.ink} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1={wall} y1={ground} x2={wall} y2={ground - 56} stroke={c.ink} strokeWidth={2.2} strokeLinecap="round" />
      <Line
        x1={wall + 14}
        y1={ground - 28}
        x2={226}
        y2={ground - 28}
        stroke={c.ink}
        strokeWidth={1}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      <AnimatedCircle animatedProps={props} cy={ground - r} r={r} fill={tone} stroke={c.ink} strokeWidth={STROKE} />
    </>
  );
}

// Weighing on you: a ball drops onto a line, stretches it like rubber, bounces once and stays down.
function Weighing({ tone }: { tone: string }) {
  const { c } = useTheme();
  const lineY = 70;
  const r = 18;
  const depth = 40;
  const left = 16;
  const right = 224;
  const mid = W / 2;
  const fall = useProgress((v) => {
    v.value = withTiming(1, { duration: 620, easing: Easing.in(Easing.quad) });
  });
  const sag = useProgress((v) => {
    v.value = withDelay(
      620,
      withSequence(
        withTiming(1.15, { duration: 320, easing: Easing.out(Easing.quad) }),
        withTiming(0.55, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
      ),
    );
  });
  const ball = useAnimatedProps(() => ({
    cy: interpolate(fall.value, [0, 1], [-r - 4, lineY - r]) + depth * sag.value,
  }));
  const band = useAnimatedProps(() => {
    const y = lineY + depth * sag.value;
    return {
      d: `M${left} ${lineY} Q${mid - 34} ${y} ${mid} ${y} Q${mid + 34} ${y} ${right} ${lineY}`,
    };
  });
  return (
    <>
      <Circle cx={left} cy={lineY} r={2.5} fill={c.ink} />
      <Circle cx={right} cy={lineY} r={2.5} fill={c.ink} />
      <AnimatedPath animatedProps={band} stroke={c.ink} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
      <AnimatedCircle animatedProps={ball} cx={mid} r={r} fill={tone} stroke={c.ink} strokeWidth={STROKE} />
    </>
  );
}

export function StateMotion({ state, label, size = W }: { state: CheckinState; label: string; size?: number }) {
  const { c } = useTheme();
  const tone = stateTone(c, state);
  return (
    <View accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
        {state === 'too-much' && <TooMuch tone={tone} />}
        {state === 'scattered' && <Scattered tone={tone} />}
        {state === 'stuck' && <Stuck tone={tone} />}
        {state === 'weighing' && <Weighing tone={tone} />}
      </Svg>
    </View>
  );
}
