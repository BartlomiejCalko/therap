import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

export type IconName =
  | 'today'
  | 'capture'
  | 'unload'
  | 'breath'
  | 'calendar'
  | 'settings'
  | 'close'
  | 'back'
  | 'arrow'
  | 'more'
  | 'plus'
  | 'refresh'
  | 'sound'
  | 'soundOff'
  | 'check'
  | 'lock';

// Hand-drawn line icons on a 24px grid, one stroke weight throughout.
export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.4,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { c } = useTheme();
  const stroke = color ?? c.ink;
  const p = { stroke, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && (
        <>
          <Circle cx={12} cy={12.5} r={4.2} {...p} />
          <Line x1={3.5} y1={18.5} x2={20.5} y2={18.5} {...p} />
        </>
      )}
      {name === 'capture' && <Path d="M7 4.5h10v15l-5-3.6-5 3.6z" {...p} />}
      {name === 'unload' && <Path d="M19.2 9.2A7.6 7.6 0 1 1 14.6 4.9" {...p} />}
      {name === 'breath' && (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Circle cx={12} cy={12} r={3.4} {...p} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={4} y={5.5} width={16} height={14} rx={2.5} {...p} />
          <Line x1={4} y1={10} x2={20} y2={10} {...p} />
          <Line x1={8.5} y1={3.5} x2={8.5} y2={6.5} {...p} />
          <Line x1={15.5} y1={3.5} x2={15.5} y2={6.5} {...p} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Line x1={4} y1={8} x2={20} y2={8} {...p} />
          <Line x1={4} y1={16} x2={20} y2={16} {...p} />
          <Circle cx={9} cy={8} r={2.2} {...p} fill={c.surface} />
          <Circle cx={15} cy={16} r={2.2} {...p} fill={c.surface} />
        </>
      )}
      {name === 'close' && (
        <>
          <Line x1={6.5} y1={6.5} x2={17.5} y2={17.5} {...p} />
          <Line x1={17.5} y1={6.5} x2={6.5} y2={17.5} {...p} />
        </>
      )}
      {name === 'back' && <Path d="M14.5 5.5 8 12l6.5 6.5" {...p} />}
      {name === 'arrow' && (
        <>
          <Line x1={5} y1={12} x2={19} y2={12} {...p} />
          <Path d="M13.5 6.5 19 12l-5.5 5.5" {...p} />
        </>
      )}
      {name === 'more' && (
        <>
          <Circle cx={6} cy={12} r={1.1} fill={stroke} />
          <Circle cx={12} cy={12} r={1.1} fill={stroke} />
          <Circle cx={18} cy={12} r={1.1} fill={stroke} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...p} />
          <Line x1={5} y1={12} x2={19} y2={12} {...p} />
        </>
      )}
      {name === 'refresh' && (
        <>
          <Path d="M18.5 12a6.5 6.5 0 1 1-2-4.7" {...p} />
          <Path d="M17 3.8v3.9h-3.9" {...p} />
        </>
      )}
      {(name === 'sound' || name === 'soundOff') && (
        <>
          <Path d="M5 9.5h3l4.5-3.5v12L8 14.5H5z" {...p} />
          {name === 'sound' ? (
            <Path d="M16 9a4.2 4.2 0 0 1 0 6M18.5 6.8a7.4 7.4 0 0 1 0 10.4" {...p} />
          ) : (
            <Path d="M16 9.5l5 5M21 9.5l-5 5" {...p} />
          )}
        </>
      )}
      {name === 'check' && <Path d="M5.5 12.5l4 4 9-9" {...p} />}
      {name === 'lock' && (
        <>
          <Rect x={5.5} y={10.5} width={13} height={9.5} rx={2.5} {...p} />
          <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...p} />
        </>
      )}
    </Svg>
  );
}
