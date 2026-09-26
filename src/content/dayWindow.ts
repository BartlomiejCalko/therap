import type { ImageSourcePropType } from 'react-native';

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export const dayPart = (d: Date): DayPart => {
  const h = d.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
};

export type WindowPhoto = {
  source: ImageSourcePropType;
  // Which text colour reads best on the photo.
  ink: 'dark' | 'light';
  // Width divided by height of the original image.
  aspect: number;
  // Which part stays in frame when the photo is cropped: 0 = top/left, 1 = bottom/right.
  focus?: { x?: number; y?: number };
};

// Photos for the Today window, one or more per part of the day.
// A part without photos keeps its painted landscape.
export const DAY_WINDOW_PHOTOS: Partial<Record<DayPart, WindowPhoto[]>> = {
  night: [
    {
      source: require('@/assets/window/night-1.jpg'),
      ink: 'light',
      aspect: 1345 / 2400,
      // Keeps the figure's head and the moons in frame.
      focus: { y: 0.2 },
    },
  ],
};

type Scene = {
  sky: [string, string];
  sun: { color: string; x: number; y: number; r: number };
  ridges: [string, string, string];
  mist: string;
  ink: 'dark' | 'light';
  stars?: boolean;
};

// Painted fallbacks: washed-out pastel landscapes, one per part of the day.
export const SCENES: Record<DayPart, Scene> = {
  morning: {
    sky: ['#F5DFD2', '#F5EEE6'],
    sun: { color: '#F0B89E', x: 282, y: 164, r: 24 },
    ridges: ['#DCDDD5', '#C9D1C8', '#B2BEB5'],
    mist: '#FBF4EE',
    ink: 'dark',
  },
  afternoon: {
    sky: ['#D9E6EE', '#F2F0E8'],
    sun: { color: '#FFFBF2', x: 300, y: 70, r: 18 },
    ridges: ['#D6DED9', '#C1CEC7', '#A6B7AE'],
    mist: '#F4F6F2',
    ink: 'dark',
  },
  evening: {
    sky: ['#E0D8EC', '#F3D9CC'],
    sun: { color: '#EAAE9F', x: 276, y: 174, r: 30 },
    ridges: ['#D6CBD9', '#BCAFC7', '#9E91AD'],
    mist: '#F6E5DF',
    ink: 'dark',
  },
  night: {
    sky: ['#1D2132', '#3A3F58'],
    sun: { color: '#F2EADA', x: 290, y: 78, r: 14 },
    ridges: ['#30354A', '#272B3D', '#1C1F2D'],
    mist: '#4C526B',
    ink: 'light',
    stars: true,
  },
};
