import type { ImageSourcePropType } from 'react-native';

import type { CheckinState, SessionType } from './copy';

// One watercolour per session, painted twice: on cream paper for the day, on deep paper for
// the night.
export const SESSION_ART: Record<SessionType, { light: ImageSourcePropType; dark: ImageSourcePropType }> = {
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

// At night the main button takes the colour of the session's painting.
export const SESSION_TINT: Record<SessionType, string> = {
  pause: '#8C6C66',
  clarity: '#5D6B5E',
  space: '#6B6190',
  release: '#56677C',
};

// The four states of mind as small watercolours on transparent paper.
export const STATE_ART: Record<CheckinState, ImageSourcePropType> = {
  'too-much': require('@/assets/states/01-za-duzo-naraz.png'),
  scattered: require('@/assets/states/02-mysli-sie-rozbiegaja.png'),
  stuck: require('@/assets/states/03-stoje-w-miejscu.png'),
  weighing: require('@/assets/states/04-cos-mi-ciazy.png'),
};
