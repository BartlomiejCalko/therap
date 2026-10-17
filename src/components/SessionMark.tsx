import type { SessionType } from '@/content/copy';

import { Glyph, type GlyphName } from './Glyph';

// One mark per session: a clock face whose filled arc shows how long the session runs.
const MARKS: Record<SessionType, GlyphName> = {
  pause: 'sessionPause',
  clarity: 'sessionClarity',
  space: 'sessionSpace',
  release: 'sessionRelease',
};

export function SessionMark({ type, size = 40, color }: { type: SessionType; size?: number; color?: string }) {
  return <Glyph name={MARKS[type]} size={size} color={color} />;
}
