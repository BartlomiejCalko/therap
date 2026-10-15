// Small ink drawings for Today: one picture per state of mind, and the session banner.
// Drawn in code so they follow the theme; each is a single quiet idea on washed-out paper.
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { CheckinState } from '@/content/copy';
import type { Palette } from '@/theme/tokens';

export const stateTone = (c: Palette, id: CheckinState) =>
  ({ 'too-much': c.pastel.peach, scattered: c.pastel.lavender, stuck: c.pastel.sage, weighing: c.pastel.mist })[id];

const line = (c: Palette) => ({ stroke: c.ink, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' }) as const;

// 64×64 drawings.
export function StateArt({ state, c, size = 64 }: { state: CheckinState; c: Palette; size?: number }) {
  const p = line(c);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x={0} y={0} width={64} height={64} rx={14} fill={stateTone(c, state)} />
      {state === 'too-much' && (
        // A crowd of circles pressing into one another.
        <>
          <Circle cx={24} cy={28} r={11} {...p} />
          <Circle cx={37} cy={25} r={9} {...p} />
          <Circle cx={33} cy={38} r={10} {...p} />
          <Circle cx={21} cy={41} r={6} {...p} />
          <Circle cx={45} cy={38} r={6} {...p} />
          <Circle cx={30} cy={16} r={4} {...p} />
        </>
      )}
      {state === 'scattered' && (
        // Thoughts flying apart from where they started.
        <>
          <Circle cx={32} cy={33} r={2.6} fill={c.ink} />
          <Line x1={36} y1={29} x2={46} y2={19} {...p} />
          <Line x1={27} y1={30} x2={18} y2={22} {...p} />
          <Line x1={36} y1={38} x2={44} y2={46} {...p} />
          <Line x1={28} y1={38} x2={22} y2={47} {...p} />
          <Circle cx={50} cy={15} r={1.8} fill={c.ink} />
          <Circle cx={14} cy={18} r={1.6} fill={c.ink} />
          <Circle cx={48} cy={50} r={1.4} fill={c.ink} />
          <Circle cx={19} cy={51} r={1.8} fill={c.ink} />
          <Circle cx={52} cy={33} r={1.2} fill={c.ink} />
        </>
      )}
      {state === 'stuck' && (
        // A stone resting on the ground, a path that doesn't continue.
        <>
          <Path d="M10 44 L54 44" {...p} />
          <Path d="M22 44 C 22 33, 42 31, 43 44" {...p} fill={c.ink} fillOpacity={0.08} />
          <Path d="M47 36 L53 36" {...p} strokeDasharray="1.5 3" />
          <Path d="M47 30 L51 30" {...p} strokeDasharray="1.5 3" />
        </>
      )}
      {state === 'weighing' && (
        // A weight bending the line it rests on.
        <>
          <Path d="M8 30 C 22 30, 24 46, 32 46 C 40 46, 42 30, 56 30" {...p} />
          <Circle cx={32} cy={36} r={8} {...p} fill={c.ink} fillOpacity={0.12} />
          <Path d="M32 18 L32 25" {...p} />
          <Path d="M29 22 L32 25 L35 22" {...p} />
        </>
      )}
    </Svg>
  );
}

// The banner behind "Choose a session": a calm horizon with the four session crests' circle motif.
export function SessionBanner({ c, width, height }: { c: Palette; width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="banner-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.pastel.mist} />
          <Stop offset="1" stopColor={c.pastel.peach} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#banner-sky)" />
      <Circle cx={width * 0.78} cy={height * 0.42} r={height * 0.16} fill={c.surface} opacity={0.75} />
      <Path
        d={`M0 ${height * 0.72} C ${width * 0.25} ${height * 0.6}, ${width * 0.45} ${height * 0.82}, ${width * 0.7} ${height * 0.68} S ${width} ${height * 0.7}, ${width} ${height * 0.66} L ${width} ${height} L 0 ${height} Z`}
        fill={c.pastel.sage}
      />
      <Path
        d={`M0 ${height * 0.86} C ${width * 0.3} ${height * 0.78}, ${width * 0.6} ${height * 0.94}, ${width} ${height * 0.82} L ${width} ${height} L 0 ${height} Z`}
        fill={c.tones[2]}
        opacity={0.9}
      />
    </Svg>
  );
}
