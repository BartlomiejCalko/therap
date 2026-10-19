import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { SessionType } from '@/content/copy';
import { SESSION_ART } from '@/content/sessionArt';
import { useTheme } from '@/theme/theme';

// A watercolour laid across the top of a quiet screen, dissolving into the paper below it, as in
// the reference designs for check-in, the reassurance and the end of a session.
export function PaintedBackdrop({
  art,
  height = 0.55,
  opacity = 0.75,
}: {
  // Which session's painting to borrow.
  art: SessionType;
  // Share of the screen's height the painting covers.
  height?: number;
  opacity?: number;
}) {
  const { c, scheme } = useTheme();
  const { width, height: screen } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  // Reaches up under the status bar, so the painting starts at the very top of the screen.
  const h = screen * height + top;
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: -top, height: h }]}>
      <Image
        source={SESSION_ART[art][scheme === 'dark' ? 'dark' : 'light']}
        contentFit="cover"
        cachePolicy="memory"
        transition={0}
        style={{ width, height: h, opacity }}
      />
      <Svg width={width} height={h} viewBox="0 0 1 1" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="backdrop-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.bg} stopOpacity={0} />
            <Stop offset="0.55" stopColor={c.bg} stopOpacity={0.35} />
            <Stop offset="1" stopColor={c.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={1} height={1} fill="url(#backdrop-fade)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
});
