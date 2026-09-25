import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { SessionType } from '@/content/copy';
import { useTheme } from '@/theme/theme';

// One crest per session, drawn like a family mark (kamon): a circle and a single idea inside.
export function SessionMark({
  type,
  size = 40,
  color,
}: {
  type: SessionType;
  size?: number;
  color?: string;
}) {
  const { c } = useTheme();
  const stroke = color ?? c.ink;
  const p = { stroke, strokeWidth: 1.2, fill: 'none', strokeLinecap: 'round' } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {type === 'pause' && (
        <>
          <Circle cx={20} cy={20} r={16} {...p} />
          <Circle cx={20} cy={20} r={2.2} fill={stroke} />
        </>
      )}
      {type === 'clarity' && (
        <>
          <Circle cx={20} cy={20} r={16} {...p} />
          <Line x1={10} y1={14.5} x2={30} y2={14.5} {...p} />
          <Line x1={8} y1={20} x2={32} y2={20} {...p} />
          <Line x1={10} y1={25.5} x2={30} y2={25.5} {...p} />
        </>
      )}
      {type === 'space' && (
        <Path d="M33.4 14.6A14.6 14.6 0 1 1 24.8 6.2" {...p} strokeWidth={1.6} />
      )}
      {type === 'release' && (
        <>
          <Path d="M9 27.5A13 13 0 0 1 31 27.5" {...p} />
          <Circle cx={10.5} cy={17} r={1.2} fill={stroke} />
          <Circle cx={15.5} cy={11} r={1.2} fill={stroke} />
          <Circle cx={22} cy={8} r={1.2} fill={stroke} />
          <Circle cx={28} cy={10.5} r={1} fill={stroke} />
          <Circle cx={32} cy={5.5} r={0.8} fill={stroke} />
        </>
      )}
    </Svg>
  );
}
