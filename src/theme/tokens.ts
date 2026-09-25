// Design tokens. Warm paper + sumi ink, one vermilion accent used sparingly.

export type Palette = {
  bg: string;
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
  // Tonal paper for cards — the text-only answer to Cosmos's image grid.
  tones: [string, string, string, string];
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F3F1EC',
    surface: '#FBFAF7',
    surfaceAlt: '#E8E5DE',
    ink: '#1B1A18',
    inkSoft: '#5E5B55',
    inkFaint: '#9C988F',
    hairline: 'rgba(27,26,24,0.12)',
    accent: '#B5462F',
    onInk: '#F3F1EC',
    scrim: 'rgba(20,19,17,0.28)',
    shadow: '#3A352C',
    tones: ['#FBFAF7', '#ECE8E0', '#E3E6E0', '#E7E4EA'],
  },
  dark: {
    bg: '#121110',
    surface: '#1C1B19',
    surfaceAlt: '#282623',
    ink: '#ECE8E0',
    inkSoft: '#A7A299',
    inkFaint: '#6F6B64',
    hairline: 'rgba(236,232,224,0.12)',
    accent: '#D26A50',
    onInk: '#121110',
    scrim: 'rgba(0,0,0,0.5)',
    shadow: '#000000',
    tones: ['#1C1B19', '#23211E', '#1D201D', '#211F24'],
  },
};

export const fonts = {
  serifLight: 'Newsreader_300Light',
  serifLightItalic: 'Newsreader_300Light_Italic',
  serif: 'Newsreader_400Regular',
  serifItalic: 'Newsreader_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
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
  card: 18,
  pill: 999,
} as const;

// Leaves room for the floating pill tab bar.
export const TAB_BAR_SPACE = 120;
