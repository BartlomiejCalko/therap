import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useSettled } from '@/lib/useSettled';

import { GLYPHS } from './glyphs.generated';

// The sunrise glyph with living rays. The rays are drawn once, as their own layer, and that layer
// breathes: it swells a little from the horizon and brightens, then settles back. Moving a drawn
// picture costs almost nothing, so the sun stays alive without weighing on scrolling.
const CYCLE = 3200;
const LENGTH = 1.3; // rays drawn longer than in the source icon

const SHAPES = GLYPHS.sunrise;
// The rays are the thin lines drawn at 1.2; everything else (sun, horizon) is the still layer.
const isRay = (props: Record<string, string | number>) => props.strokeWidth === 1.2;
const RAYS = SHAPES.filter(([tag, p]) => tag === 'line' && isRay(p)).map(([, p]) => p);
const STILL = SHAPES.filter(([tag, p]) => !(tag === 'line' && isRay(p)));

// Where the rays fan out from, in the glyph's 64 grid: the centre of the sun on the horizon.
const ORIGIN = { x: 32, y: 46 };

export const Sunrise = memo(function Sunrise({
  size,
  color,
  weight = 1,
  crop = [4, 18, 56, 38],
}: {
  size: number;
  color: string;
  weight?: number;
  crop?: [number, number, number, number];
}) {
  const reduced = useReducedMotion();
  const settled = useSettled();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduced || !settled) {
      cancelAnimation(breath);
      return;
    }
    breath.value = withRepeat(withTiming(1, { duration: CYCLE / 2, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breath);
  }, [reduced, settled, breath]);

  const height = (size * crop[3]) / crop[2];
  // The layer scales around the sun's centre, so the rays reach outward rather than drift.
  const originX = ((ORIGIN.x - crop[0]) / crop[2]) * size;
  const originY = ((ORIGIN.y - crop[1]) / crop[3]) * height;
  const rays = useAnimatedStyle(() => {
    const s = 0.94 + 0.08 * breath.value;
    return {
      opacity: 0.72 + 0.28 * breath.value,
      transform: [
        { translateX: originX - size / 2 },
        { translateY: originY - height / 2 },
        { scale: s },
        { translateX: -(originX - size / 2) },
        { translateY: -(originY - height / 2) },
      ],
    };
  });

  const stroke = (w: number | string | undefined) => Number(w ?? 1.5) * weight;
  const viewBox = crop.join(' ');

  return (
    <View style={{ width: size, height }}>
      <Animated.View shouldRasterizeIOS renderToHardwareTextureAndroid style={[StyleSheet.absoluteFill, rays]}>
        <Svg width={size} height={height} viewBox={viewBox}>
          {RAYS.map((r, i) => {
            const x1 = Number(r.x1);
            const y1 = Number(r.y1);
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x1 + (Number(r.x2) - x1) * LENGTH}
                y2={y1 + (Number(r.y2) - y1) * LENGTH}
                stroke={color}
                strokeWidth={stroke(r.strokeWidth)}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>
      </Animated.View>
      <Svg width={size} height={height} viewBox={viewBox} style={StyleSheet.absoluteFill}>
        {STILL.map(([tag, props], i) => {
          const { strokeWidth, stroke: s, fill, ...rest } = props;
          const Shape = tag === 'path' ? Path : tag === 'circle' ? Circle : Line;
          return (
            <Shape
              key={i}
              {...rest}
              fill={fill === 'ink' ? color : 'none'}
              stroke={s === 'none' ? 'none' : color}
              strokeWidth={stroke(strokeWidth)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </Svg>
    </View>
  );
});
