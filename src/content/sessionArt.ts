import { Image as ExpoImage } from 'expo-image';

import type { CheckinState, SessionType } from './copy';

// One watercolour per session, painted twice: on cream paper for the day, on deep paper for
// the night.
// Bundled pictures are asset numbers (what `require` gives back), which every image component takes.
export const SESSION_ART: Record<SessionType, { light: number; dark: number }> = {
  pause: { light: require('@/assets/sessions/pause-light.jpg'), dark: require('@/assets/sessions/pause-dark.jpg') },
  clarity: {
    light: require('@/assets/sessions/clarity-light.jpg'),
    dark: require('@/assets/sessions/clarity-dark.jpg'),
  },
  space: { light: require('@/assets/sessions/space-light.jpg'), dark: require('@/assets/sessions/space-dark.jpg') },
  release: {
    light: require('@/assets/sessions/release-light.jpg'),
    dark: require('@/assets/sessions/release-dark.jpg'),
  },
};

// The four states of mind as small watercolours on transparent paper.
export const STATE_ART: Record<CheckinState, number> = {
  'too-much': require('@/assets/states/01-za-duzo-naraz.png'),
  scattered: require('@/assets/states/02-mysli-sie-rozbiegaja.png'),
  stuck: require('@/assets/states/03-stoje-w-miejscu.png'),
  weighing: require('@/assets/states/04-cos-mi-ciazy.png'),
};

// Decodes every painting once, when the app starts, and keeps it in memory, so screens that
// show them never decode a large picture in the middle of a transition.
const decoded: unknown[] = [];
export function preloadArt() {
  if (decoded.length) return;
  const sources = [
    ...Object.values(SESSION_ART).flatMap((art) => [art.light, art.dark]),
    ...Object.values(STATE_ART),
  ];
  for (const source of sources) {
    ExpoImage.loadAsync(source)
      .then((ref) => decoded.push(ref))
      .catch(() => {});
  }
}
