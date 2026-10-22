// Design tokens: "Unload Hol". A heritage interior — marble and parchment by day, ink-dark
// panelling by night — with antique brass for the fine lines and forest-green velvet for every
// call to action. Colours follow the Unload Hol palette (design_system/paleta.pdf).

export type Palette = {
  bg: string;
  // Cards: raised parchment (day) or panelling (night), very slightly translucent.
  surface: string;
  // Sunken wells: inputs, segmented controls, the off state of a toggle.
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  hairline: string;
  // Antique brass, used sparingly for small marks and the faint tone of text.
  accent: string;
  // Brass deep enough to read as text: letterspaced labels and kickers.
  accentText: string;
  onInk: string;
  scrim: string;
  shadow: string;
  tones: [string, string, string, string];
  // Four muted grounds behind small illustrations.
  pastel: { peach: string; lavender: string; sage: string; mist: string };
  // Soft surface laid over pictures (round header buttons).
  veil: string;
  // The thread of brass: selected rings, rules, frames, the ornament.
  gold: string;
  // A brass hairline strong enough to frame a card or a picture.
  frame: string;
  // The main call to action: forest-green velvet, with a brass edge.
  primary: string;
  primaryPressed: string;
  primaryEdge: string;
  onPrimary: string;
  danger: string;
  // The light of a reading lamp, glowing on the wall behind every screen.
  lamp: string;
  // A faint wash of green over the wall, as if it were papered in velvet.
  wall: string;
  // Each session's own colour, for its mark and its card.
  session: { pause: string; clarity: string; space: string; release: string };
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F1ECE6',
    surface: 'rgba(250,247,243,0.94)',
    surfaceAlt: '#E8E1D8',
    ink: '#1E2428',
    inkSoft: '#5C5A49',
    inkFaint: '#7E7964',
    hairline: 'rgba(149,132,108,0.28)',
    accent: '#A3814D',
    accentText: '#7A5E32',
    onInk: '#F1ECE6',
    scrim: 'rgba(30,36,40,0.40)',
    shadow: '#3E3D2B',
    tones: ['#F0E2D9', '#EFE3D6', '#E4E1D2', '#EEE3CF'],
    pastel: { peach: '#F0DCCF', lavender: '#E6DCCB', sage: '#E2DFCF', mist: '#E8E1D8' },
    veil: 'rgba(250,247,243,0.84)',
    gold: '#B08D57',
    frame: 'rgba(163,129,77,0.55)',
    primary: '#2E4434',
    primaryPressed: '#243629',
    primaryEdge: 'rgba(201,166,107,0.55)',
    onPrimary: '#F4EEE4',
    danger: '#9A4220',
    lamp: '#F3DFC0',
    wall: '#E2DFCF',
    session: { pause: '#B87758', clarity: '#6E6A4C', space: '#A3814D', release: '#8C3B1A' },
  },
  dark: {
    bg: '#141619',
    surface: 'rgba(29,33,37,0.92)',
    surfaceAlt: '#0F1113',
    ink: '#EDE7E0',
    inkSoft: '#B3AC9C',
    inkFaint: '#857F72',
    hairline: 'rgba(212,180,126,0.16)',
    accent: '#C9A66B',
    accentText: '#D4B47E',
    onInk: '#141619',
    scrim: 'rgba(0,0,0,0.55)',
    shadow: '#000000',
    tones: ['#251E1A', '#26211D', '#22231D', '#26231B'],
    pastel: { peach: '#2C221D', lavender: '#26231C', sage: '#232520', mist: '#1E2226' },
    veil: 'rgba(20,22,25,0.62)',
    gold: '#C9A66B',
    frame: 'rgba(201,166,107,0.42)',
    primary: '#2F4A38',
    primaryPressed: '#263D2E',
    primaryEdge: 'rgba(212,180,126,0.45)',
    onPrimary: '#EBD8B0',
    danger: '#D98B63',
    lamp: '#3A3122',
    wall: '#1B2620',
    session: { pause: '#D9A07F', clarity: '#A9A27E', space: '#C9A66B', release: '#D98B63' },
  },
};

export const fonts = {
  // Cormorant Garamond: a high-contrast book serif for headings and calls to action. It runs
  // small, so it is set a little larger than a book face would be.
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
  card: 16,
  pill: 999,
  // Calls to action: softly squared, like a brass plate rather than a pill.
  button: 14,
} as const;

// Leaves room for the floating pill tab bar.
export const TAB_BAR_SPACE = 120;
