import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import {
  DAY_PART_LABEL,
  DAY_WINDOW_PHOTOS,
  SCENES,
  dayPart,
  type DayPart,
  type WindowPhoto,
} from '@/content/dayWindow';
import { timeOfDay } from '@/lib/date';
import { useTheme } from '@/theme/theme';
import { fonts } from '@/theme/tokens';

import { PaperTexture } from './PaperTexture';
import { T } from './T';

const VB = '0 0 350 320';
const HEIGHT = 320;
// Layers are wider than the card so their drift never reveals an edge.
const BLEED = 28;

const RIDGES = [
  'M-30 212C20 188 64 184 104 198S186 176 236 190S328 178 380 196L380 320L-30 320Z',
  'M-30 236C30 214 82 220 132 232S226 208 286 224S350 214 380 222L380 320L-30 320Z',
  'M-30 266C40 250 104 256 164 266S276 248 380 262L380 320L-30 320Z',
];

const STARS: [number, number, number, number][] = [
  [24, 128, 0.8, 0.5], [58, 150, 0.6, 0.4], [92, 138, 1, 0.7], [118, 160, 0.6, 0.5],
  [150, 146, 0.9, 0.6], [176, 30, 0.7, 0.5], [196, 104, 1.1, 0.8], [214, 22, 0.6, 0.4],
  [232, 136, 0.7, 0.6], [246, 92, 0.6, 0.5], [308, 124, 1, 0.7], [326, 40, 0.7, 0.6],
  [334, 158, 0.6, 0.4], [300, 18, 0.8, 0.5], [236, 60, 0.6, 0.4], [168, 118, 0.6, 0.5],
];

const TEXT = {
  dark: { ink: '#1B1A18', soft: '#57524B', faint: 'rgba(27,26,24,0.55)' },
  light: { ink: '#F3EFE7', soft: 'rgba(243,239,231,0.78)', faint: 'rgba(243,239,231,0.6)' },
};

// A slow back-and-forth, used for drifting ridges, mist and the breathing zoom.
function useSway(duration: number) {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    v.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, reduced, v]);
  return v;
}

function Layer({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.layer, style]}>
      <Svg width="100%" height="100%" viewBox={VB} preserveAspectRatio="xMidYMid slice">
        {children}
      </Svg>
    </Animated.View>
  );
}

function PaintedScene({ part }: { part: DayPart }) {
  const s = SCENES[part];
  const far = useSway(19000);
  const mid = useSway(25000);
  const near = useSway(31000);
  const mist = useSway(23000);
  const glow = useSway(9000);

  const farStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (far.value - 0.5) * 10 }] }));
  const midStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (0.5 - mid.value) * 16 }] }));
  const nearStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (near.value - 0.5) * 22 }] }));
  const mistStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + mist.value * 0.4,
    transform: [{ translateX: (mist.value - 0.5) * 40 }],
  }));
  const sunStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + glow.value * 0.15,
    transform: [{ translateY: (0.5 - glow.value) * 4 }],
  }));

  return (
    <>
      <Layer>
        <Defs>
          <LinearGradient id={`sky-${part}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.sky[0]} />
            <Stop offset="1" stopColor={s.sky[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="-40" y="-20" width="430" height="360" fill={`url(#sky-${part})`} />
        {s.stars && STARS.map(([x, y, r, o], i) => <Circle key={i} cx={x} cy={y} r={r} fill="#F2EADA" opacity={o} />)}
      </Layer>

      <Layer style={sunStyle}>
        <Defs>
          <RadialGradient id={`halo-${part}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={s.sun.color} stopOpacity={0.55} />
            <Stop offset="1" stopColor={s.sun.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r * 3.2} fill={`url(#halo-${part})`} />
        <Circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r} fill={s.sun.color} />
      </Layer>

      <Layer style={farStyle}>
        <Path d={RIDGES[0]} fill={s.ridges[0]} />
      </Layer>

      <Layer style={mistStyle}>
        <Defs>
          <LinearGradient id={`mist-${part}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.mist} stopOpacity={0} />
            <Stop offset="0.5" stopColor={s.mist} stopOpacity={0.8} />
            <Stop offset="1" stopColor={s.mist} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="-60" y="186" width="470" height="64" fill={`url(#mist-${part})`} />
      </Layer>

      <Layer style={midStyle}>
        <Path d={RIDGES[1]} fill={s.ridges[1]} />
      </Layer>

      <Layer style={nearStyle}>
        <Path d={RIDGES[2]} fill={s.ridges[2]} />
      </Layer>
    </>
  );
}

// Fills the card like `cover`, but keeps the photo's focus point in frame instead of its centre.
function PhotoLayer({ photo, width }: { photo: WindowPhoto; width: number }) {
  if (!width) return null;
  const scale = Math.max(width / photo.aspect, HEIGHT);
  const w = photo.aspect * scale;
  const h = scale;
  const left = -(w - width) * (photo.focus?.x ?? 0.5);
  const top = -(h - HEIGHT) * (photo.focus?.y ?? 0.5);
  return <Image source={photo.source} style={{ position: 'absolute', width: w, height: h, left, top }} />;
}

// Darkens (or lightens) the top and foot of a photo so the greeting and subtitle stay readable.
function PhotoScrim({ ink }: { ink: 'dark' | 'light' }) {
  const tint = ink === 'light' ? '#000' : '#FFF';
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="window-scrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity={0.45} />
          <Stop offset="0.45" stopColor={tint} stopOpacity={0} />
          <Stop offset="0.62" stopColor={tint} stopOpacity={0} />
          <Stop offset="1" stopColor={tint} stopOpacity={0.7} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#window-scrim)" />
    </Svg>
  );
}

// The Today window: a scene for the current part of the day, with the greeting in its sky.
export function DayWindow({ now, title, subtitle }: { now: Date; title: string; subtitle: string }) {
  const { c, scheme } = useTheme();
  const part = dayPart(now);
  const photos = DAY_WINDOW_PHOTOS[part] ?? [];
  // Same photo all day, a different one tomorrow.
  const photo = photos.length ? photos[Math.floor(now.getTime() / 86_400_000) % photos.length] : null;
  const ink = photo ? photo.ink : SCENES[part].ink;
  const text = TEXT[ink];
  // Photos are busier than the painted sky, so text gets a soft halo there.
  const halo = photo
    ? {
        textShadowColor: ink === 'light' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)',
        textShadowRadius: 14,
        textShadowOffset: { width: 0, height: 1 },
      }
    : null;

  const [width, setWidth] = useState(0);
  const breathe = useSway(28000);
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.045 }] }));

  return (
    <View
      accessibilityRole="header"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.card, { borderColor: c.hairline, backgroundColor: SCENES[part].sky[1] }]}>
      <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
        {photo ? (
          <PhotoLayer photo={photo} width={width} />
        ) : (
          <PaintedScene part={part} />
        )}
      </Animated.View>

      {photo && <PhotoScrim ink={ink} />}

      <PaperTexture tone={ink === 'light' ? 'chalk' : 'ink'} opacity={photo ? 0.2 : ink === 'light' ? 0.3 : 0.7} />
      {scheme === 'dark' && ink === 'dark' && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18,17,16,0.16)' }]} />
      )}

      <View style={styles.text}>
        <T variant="label" style={[{ color: photo ? text.soft : text.faint }, halo]}>
          {DAY_PART_LABEL[part]} · {timeOfDay(now.getTime())}
        </T>
        <T variant="display" style={[styles.title, { color: text.ink }, halo]}>
          {title}
        </T>
      </View>
      <T variant="italic" style={[styles.subtitle, { color: text.ink }, halo, photo && { opacity: 1 }]}>
        {subtitle}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  layer: { position: 'absolute', top: 0, bottom: 0, left: -BLEED, right: -BLEED },
  text: { position: 'absolute', left: 22, right: 22, top: 20, gap: 6 },
  title: { fontFamily: fonts.serifLight, fontSize: 34, lineHeight: 40, marginTop: 6 },
  subtitle: { position: 'absolute', left: 22, right: 22, bottom: 18, fontSize: 17, lineHeight: 24, opacity: 0.85 },
});
