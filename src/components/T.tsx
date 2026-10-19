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
  // Cormorant runs small: headings are set larger and tighter than a book face would be.
  display: { fontFamily: fonts.serifLight, fontSize: 40, lineHeight: 44, letterSpacing: -0.4 },
  title: { fontFamily: fonts.serifLight, fontSize: 34, lineHeight: 39, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.serif, fontSize: 25, lineHeight: 30, letterSpacing: -0.1 },
  serif: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 29 },
  serifSmall: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 24 },
  italic: { fontFamily: fonts.serifItalic, fontSize: 21, lineHeight: 29 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19 },
  medium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 20 },
  // The person's own words, outside the writing machine.
  type: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 28 },
  typeSmall: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 23 },
  // The writing machine's own typewriter face.
  mono: { fontFamily: fonts.typewriter, fontSize: 17, lineHeight: 27 },
  monoSmall: { fontFamily: fonts.typewriter, fontSize: 14, lineHeight: 21 },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 2.6,
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
