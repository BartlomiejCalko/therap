// Structure of the product: ids, lengths and rhythms. All wording lives in src/i18n.

export type CheckinState = 'too-much' | 'scattered' | 'stuck' | 'weighing';
export const CHECKIN_STATES: CheckinState[] = ['too-much', 'scattered', 'stuck', 'weighing'];

export type SessionType = 'pause' | 'clarity' | 'space' | 'release';
export const SESSIONS: { id: SessionType; minutes: number }[] = [
  { id: 'pause', minutes: 5 },
  { id: 'clarity', minutes: 12 },
  { id: 'space', minutes: 25 },
  { id: 'release', minutes: 50 },
];
export const sessionMinutes = (id: string) => SESSIONS.find((s) => s.id === id)?.minutes ?? SESSIONS[0].minutes;
export const isSessionType = (id: string): id is SessionType => SESSIONS.some((s) => s.id === id);

export type ShiftArea = 'mind' | 'body' | 'attention';
export type ShiftValue = 'better' | 'same' | 'worse';
export const SHIFT_AREAS: ShiftArea[] = ['mind', 'body', 'attention'];
export const SHIFT_VALUES: ShiftValue[] = ['better', 'same', 'worse'];

export type SoundId = 'none' | 'rain' | 'brown' | 'drone';
export const SOUNDS: SoundId[] = ['none', 'rain', 'brown', 'drone'];

export type BreathPhaseKind = 'in' | 'hold' | 'out' | 'rest';
export type BreathPatternId = 'settle' | 'box' | 'deep' | 'even';

export type BreathPattern = {
  id: BreathPatternId;
  rhythm: string;
  phases: { kind: BreathPhaseKind; seconds: number }[];
};

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'settle',
    rhythm: '4 · 6',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'out', seconds: 6 },
    ],
  },
  {
    id: 'box',
    rhythm: '4 · 4 · 4 · 4',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 4 },
      { kind: 'out', seconds: 4 },
      { kind: 'rest', seconds: 4 },
    ],
  },
  {
    id: 'deep',
    rhythm: '4 · 7 · 8',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 7 },
      { kind: 'out', seconds: 8 },
    ],
  },
  {
    id: 'even',
    rhythm: '5 · 5',
    phases: [
      { kind: 'in', seconds: 5 },
      { kind: 'out', seconds: 5 },
    ],
  },
];
