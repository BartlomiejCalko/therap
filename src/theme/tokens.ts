// Design tokens. Watercolour light: a night sky of washed indigo in dark mode, a milky dawn in
// light mode; ink in warm cream or aubergine, and one thread of gold for what is precious.

export type Palette = {
  bg: string;
  // Cards and sheets are glass: translucent, so the living background breathes through them.
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
  // Tinted glass for the four sessions.
  tones: [string, string, string, string];
  // Four watercolour washes, one per state of mind.
  pastel: { peach: string; lavender: string; sage: string; mist: string };
  // Soft surface laid over pastel cards (for small round buttons).
  veil: string;
  // The thread of gold: hairlines, sparks, the sun.
  gold: string;
  // The living background: sky gradient (top, middle, bottom), three drifting stains, and the
  // colour of the stars (night) or dust (dawn).
  sky: [string, string, string];
  stains: [string, string, string];
  star: string;
  // How strongly the watercolour painting shows through the sky.
  paintOpacity: number;
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F3EEF1',
    surface: 'rgba(255,252,250,0.74)',
    surfaceAlt: 'rgba(236,228,238,0.9)',
    ink: '#2B2438',
    inkSoft: '#5E556E',
    inkFaint: '#998FA8',
    hairline: 'rgba(43,36,56,0.12)',
    accent: '#C0643F',
    onInk: '#F7F2F4',
    scrim: 'rgba(32,24,44,0.3)',
    shadow: '#3B2D4F',
    tones: ['rgba(248,229,216,0.78)', 'rgba(230,222,246,0.78)', 'rgba(222,236,226,0.78)', 'rgba(219,230,243,0.78)'],
    pastel: { peach: '#F5E2D6', lavender: '#E6DEF4', sage: '#DDEADF', mist: '#D9E5F1' },
    veil: 'rgba(255,255,255,0.6)',
    gold: '#B58A45',
    sky: ['#F6F0EC', '#EFE6F2', '#F4ECEE'],
    stains: ['rgba(206,182,236,0.55)', 'rgba(246,200,176,0.5)', 'rgba(188,214,232,0.45)'],
    star: '#C9A15C',
    paintOpacity: 0.42,
  },
  dark: {
    bg: '#0D0A18',
    surface: 'rgba(33,27,54,0.62)',
    surfaceAlt: 'rgba(255,255,255,0.08)',
    ink: '#F3EDE5',
    inkSoft: '#BBB1CC',
    inkFaint: '#978DAE',
    hairline: 'rgba(243,237,229,0.13)',
    accent: '#E58A66',
    onInk: '#120E20',
    scrim: 'rgba(5,3,12,0.62)',
    shadow: '#000000',
    tones: ['rgba(78,48,52,0.58)', 'rgba(60,48,98,0.58)', 'rgba(40,60,50,0.58)', 'rgba(36,52,78,0.58)'],
    pastel: { peach: '#3B2B2E', lavender: '#2F2850', sage: '#243429', mist: '#22324A' },
    veil: 'rgba(255,255,255,0.08)',
    gold: '#E4BF7A',
    sky: ['#0B0816', '#191032', '#0E0B1C'],
    stains: ['rgba(122,92,214,0.42)', 'rgba(214,128,150,0.26)', 'rgba(72,118,196,0.32)'],
    star: '#F6EBD7',
    paintOpacity: 0.26,
  },
};

export const fonts = {
  serifLight: 'Newsreader_300Light',
  serifLightItalic: 'Newsreader_300Light_Italic',
  serif: 'Newsreader_400Regular',
  serifItalic: 'Newsreader_400Regular_Italic',
  serifMedium: 'Newsreader_500Medium',
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
  card: 18,
  pill: 999,
  // Calls to action: a soft rectangle rather than a pill.
  button: 14,
} as const;

// Leaves room for the docked glass tab bar.
export const TAB_BAR_SPACE = 120;
