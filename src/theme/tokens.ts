// Design tokens. Cream watercolour paper with warm ink, a thread of gold, and one deep forest
// green for the main call to action. Dark mode is the same paintings at night.

export type Palette = {
  bg: string;
  // Cards: a soft, slightly translucent paper over the watercolours.
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  hairline: string;
  accent: string;
  onInk: string;
  scrim: string;
  shadow: string;
  tones: [string, string, string, string];
  // Four washed-out pastels, used behind small illustrations.
  pastel: { peach: string; lavender: string; sage: string; mist: string };
  // Soft surface laid over pictures (round header buttons).
  veil: string;
  // The thread of gold: the selected ring, small rules, the ensō.
  gold: string;
  // The main call to action: deep forest green on paper; at night each session lends its own tint.
  primary: string;
  onPrimary: string;
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F6F1E9',
    surface: 'rgba(255,253,249,0.86)',
    surfaceAlt: '#EDE6DA',
    ink: '#2A2621',
    inkSoft: '#5E5850',
    inkFaint: '#9B948A',
    hairline: 'rgba(42,38,33,0.11)',
    accent: '#B5683F',
    onInk: '#F6F1E9',
    scrim: 'rgba(30,26,20,0.28)',
    shadow: '#4A3F30',
    tones: ['#FBF7F1', '#EFE8DD', '#E6EBE2', '#ECE6EE'],
    pastel: { peach: '#F3E3DA', lavender: '#E9E3F0', sage: '#E2E9DF', mist: '#DFE7EE' },
    veil: 'rgba(255,253,249,0.78)',
    gold: '#C4A066',
    primary: '#24362D',
    onPrimary: '#F6F1E9',
  },
  dark: {
    bg: '#121311',
    surface: 'rgba(32,33,30,0.86)',
    surfaceAlt: '#262722',
    ink: '#EFEAE1',
    inkSoft: '#B3ADA3',
    inkFaint: '#7D786F',
    hairline: 'rgba(239,234,225,0.13)',
    accent: '#D9A27A',
    onInk: '#121311',
    scrim: 'rgba(0,0,0,0.55)',
    shadow: '#000000',
    tones: ['#1E1F1C', '#25241F', '#1F2420', '#232129'],
    pastel: { peach: '#3A2D2A', lavender: '#2D2938', sage: '#263029', mist: '#252D36' },
    veil: 'rgba(20,21,19,0.55)',
    gold: '#D4B27A',
    primary: '#5D6B5E',
    onPrimary: '#F3EEE5',
  },
};

export const fonts = {
  // Cormorant Garamond: the high-contrast serif of the reference designs, for headings and calls
  // to action. It runs small, so it is set a little larger than a book face would be.
  serifLight: 'CormorantGaramond_500Medium',
  serifLightItalic: 'CormorantGaramond_500Medium_Italic',
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMedium: 'CormorantGaramond_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  // The typewriter face belongs to the writing machine alone.
  typewriter: 'CourierPrime_400Regular',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 20,
} as const;

export const radius = {
  card: 20,
  pill: 999,
  // Calls to action: generously rounded, nearly a pill.
  button: 26,
} as const;

// Leaves room for the floating pill tab bar.
export const TAB_BAR_SPACE = 120;
