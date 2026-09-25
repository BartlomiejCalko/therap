import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

// An ensō drawn in one slow stroke, left open — the closing image of a session.
const ENSO = 'M151 72C156 112 124 150 82 151C40 152 8 120 9 80C10 41 42 9 82 10C104 10 122 19 134 33';
const LENGTH = 440;
const DURATION = 2200;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Driven from JS frames so the stroke draws the same way on iOS, Android and web.
function useDrawProgress(delay: number) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      setProgress(easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delay]);
  return progress;
}

export function Enso({ size = 150, delay = 200 }: { size?: number; delay?: number }) {
  const { c } = useTheme();
  const progress = useDrawProgress(delay);
  const offset = LENGTH * (1 - progress);

  if (progress === 0) return <Svg width={size} height={size} />;

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Path
        d={ENSO}
        stroke={c.ink}
        strokeWidth={13}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${LENGTH} ${LENGTH}`}
        strokeDashoffset={offset}
        opacity={0.1}
      />
      <Path
        d={ENSO}
        stroke={c.ink}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${LENGTH} ${LENGTH}`}
        strokeDashoffset={offset}
        opacity={0.9}
      />
    </Svg>
  );
}
