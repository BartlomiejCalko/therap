import { memo, useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { GLYPHS } from './glyphs.generated';

const AnimatedLine = Animated.createAnimatedComponent(Line);

// The sunrise glyph with living rays: each ray slowly lengthens and settles back, the pulse
// starting at the middle ray and spreading out to both sides, like light leaving the sun.
// Spreading outward means a new pulse never has to jump back across the arc.
const CYCLE = 3200;
const REACH = 0.16; // how much of its length a ray gives up at its shortest
const LENGTH = 1.3; // rays drawn longer than in the source icon
const SPREAD = 0.35; // share of a cycle the pulse takes to reach the outermost rays

const SHAPES = GLYPHS.sunrise;
// The rays are the thin lines drawn at 1.2; everything else (sun, horizon) stays still.
const isRay = (props: Record<string, string | number>) => props.strokeWidth === 1.2;
const RAYS = SHAPES.filter(([tag, p]) => tag === 'line' && isRay(p)).map(([, p]) => p);
const STILL = SHAPES.filter(([tag, p]) => !(tag === 'line' && isRay(p)));

function Ray({
  ray,
  index,
  clock,
  ink,
  width,
}: {
  ray: Record<string, string | number>;
  index: number;
  clock: SharedValue<number>;
  ink: string;
  width: number;
}) {
  const x1 = Number(ray.x1);
  const y1 = Number(ray.y1);
  const dx = Number(ray.x2) - x1;
  const dy = Number(ray.y2) - y1;
  // Distance from the middle ray, 0 → 1; outer rays follow the centre a little later.
  const middle = (RAYS.length - 1) / 2;
  const phase = (Math.abs(index - middle) / middle) * SPREAD;
  const props = useAnimatedProps(() => {
    // 0 → 1 → 0 once per cycle; continuous across the loop, so there is no seam.
    const wave = 0.5 - 0.5 * Math.cos(2 * Math.PI * (clock.value - phase));
    const s = LENGTH * (1 - REACH * wave);
    return { x2: x1 + dx * s, y2: y1 + dy * s, opacity: 1 - 0.25 * wave };
  });
  // Where the ray sits at the start of the loop, so the first frame matches the animation.
  const start = LENGTH * (1 - REACH * (0.5 - 0.5 * Math.cos(2 * Math.PI * -phase)));
  return (
    <AnimatedLine
      animatedProps={props}
      x1={x1}
      y1={y1}
      x2={x1 + dx * start}
      y2={y1 + dy * start}
      stroke={ink}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

// Memoised so a re-render of the screen around it never resets the rays mid-motion.
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
  const clock = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    clock.value = withRepeat(withTiming(1, { duration: CYCLE, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [reduced, clock]);

  return (
    <Svg width={size} height={(size * crop[3]) / crop[2]} viewBox={crop.join(' ')}>
      {STILL.map(([tag, props], i) => {
        const { strokeWidth = 1.5, stroke, fill, ...rest } = props;
        const Shape = tag === 'path' ? Path : tag === 'circle' ? Circle : Line;
        return (
          <Shape
            key={i}
            {...rest}
            fill={fill === 'ink' ? color : 'none'}
            stroke={stroke === 'none' ? 'none' : color}
            strokeWidth={Number(strokeWidth) * weight}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      {RAYS.map((ray, i) => (
        <Ray key={i} ray={ray} index={i} clock={clock} ink={color} width={1.2 * weight} />
      ))}
    </Svg>
  );
});
