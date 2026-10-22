import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

import { PaperTexture } from './PaperTexture';

// The wall behind every quiet screen: a reading lamp's warm glow falling from the upper right,
// a faint wash of green velvet pooling low on the left, and a plaster grain over both.
export function Wall({ grain = true }: { grain?: boolean }) {
  const { c, scheme } = useTheme();
  const dark = scheme === 'dark';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="wall-lamp" cx="1" cy="-0.12" r="0.95" fx="1" fy="-0.12">
            <Stop offset="0" stopColor={c.lamp} stopOpacity={0.8} />
            <Stop offset="0.55" stopColor={c.lamp} stopOpacity={dark ? 0.28 : 0.22} />
            <Stop offset="1" stopColor={c.lamp} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="wall-velvet" cx="0.05" cy="1.02" r="0.95" fx="0.05" fy="1.02">
            <Stop offset="0" stopColor={c.wall} stopOpacity={dark ? 0.95 : 0.7} />
            <Stop offset="1" stopColor={c.wall} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={1} height={1} fill="url(#wall-velvet)" />
        <Rect x={0} y={0} width={1} height={1} fill="url(#wall-lamp)" />
      </Svg>
      {grain && <PaperTexture opacity={dark ? 0.28 : 0.55} />}
    </View>
  );
}

// A brass rule with a small lozenge at its centre, the divider of the heritage palette cards.
export function Ornament({
  width = 120,
  align = 'center',
  style,
}: {
  width?: number;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const line = { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.frame };
  return (
    <View
      style={[
        styles.ornament,
        { width, alignSelf: align === 'center' ? 'center' : 'flex-start' },
        style,
      ]}>
      <View style={line} />
      <View style={[styles.lozenge, { borderColor: c.gold }]} />
      <View style={line} />
    </View>
  );
}

const styles = StyleSheet.create({
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lozenge: { width: 5, height: 5, borderWidth: 1, transform: [{ rotate: '45deg' }] },
});
