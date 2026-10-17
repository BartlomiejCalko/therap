import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

import { GLYPHS, type GlyphName } from './glyphs.generated';

export type { GlyphName };

const BASE_STROKE = 1.5;
const SHAPES = { path: Path, line: Line, circle: Circle } as const;

// The hand-drawn line icons from assets/icons. They are drawn on a 64 grid; when shown small,
// the strokes are thickened so the finest lines still read instead of vanishing.
export function Glyph({
  name,
  size = 48,
  color,
  weight,
  crop,
}: {
  name: GlyphName;
  size?: number;
  color?: string;
  // Multiplies every stroke; defaults to whatever keeps the main line at about one pixel.
  weight?: number;
  // Part of the 64 grid to show, as [x, y, width, height]; `size` is then the width.
  crop?: [number, number, number, number];
}) {
  const { c } = useTheme();
  const ink = color ?? c.ink;
  const k = weight ?? Math.max(1, 47 / size);

  return (
    <Svg
      width={size}
      height={crop ? (size * crop[3]) / crop[2] : size}
      viewBox={crop ? crop.join(' ') : '0 0 64 64'}>
      {GLYPHS[name].map(([tag, props], i) => {
        const Shape = SHAPES[tag];
        const { strokeWidth = BASE_STROKE, stroke, fill, ...rest } = props;
        return (
          <Shape
            key={i}
            {...rest}
            fill={fill === 'ink' ? ink : 'none'}
            stroke={stroke === 'none' ? 'none' : ink}
            strokeWidth={Number(strokeWidth) * k}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}
