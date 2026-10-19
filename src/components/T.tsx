import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/theme';
import { fonts, type Palette } from '@/theme/tokens';

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'serif'
  | 'serifSmall'
  | 'italic'
  | 'body'
  | 'small'
  | 'medium'
  | 'label'
  | 'type'
  | 'typeSmall'
  | 'mono'
  | 'monoSmall';

type Tone = 'ink' | 'soft' | 'faint' | 'accent' | 'onInk';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.serifLight, fontSize: 42, lineHeight: 47, letterSpacing: -0.8 },
  title: { fontFamily: fonts.serifLight, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  serif: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 28 },
  serifSmall: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 23 },
  italic: { fontFamily: fonts.serifLightItalic, fontSize: 19, lineHeight: 28 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  medium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 20 },
  // The person's own words, outside the writing machine.
  type: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27 },
  typeSmall: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 21 },
  // The writing machine's own typewriter face.
  mono: { fontFamily: fonts.typewriter, fontSize: 17, lineHeight: 27 },
  monoSmall: { fontFamily: fonts.typewriter, fontSize: 14, lineHeight: 21 },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
};

const toneColor = (c: Palette, tone: Tone) =>
  ({ ink: c.ink, soft: c.inkSoft, faint: c.inkFaint, accent: c.accent, onInk: c.onInk })[tone];

export function T({
  variant = 'body',
  tone,
  center,
  style,
  ...props
}: TextProps & { variant?: Variant; tone?: Tone; center?: boolean }) {
  const { c } = useTheme();
  const defaultTone: Tone = variant === 'label' ? 'faint' : 'ink';
  return (
    <Text
      {...props}
      style={[
        variants[variant],
        { color: toneColor(c, tone ?? defaultTone) },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
