// All product copy lives here, taken from the Unload spec.

export type CheckinState = 'too-much' | 'scattered' | 'stuck' | 'weighing';

export const CHECKIN_STATES: { id: CheckinState; label: string }[] = [
  { id: 'too-much', label: 'Too much at once' },
  { id: 'scattered', label: 'My mind feels scattered' },
  { id: 'stuck', label: 'I feel stuck' },
  { id: 'weighing', label: 'Something is weighing on me' },
];

export const stateLabel = (id?: string) =>
  CHECKIN_STATES.find((s) => s.id === id)?.label ?? '';

export type SessionType = 'pause' | 'clarity' | 'space' | 'release';

export const SESSIONS: { id: SessionType; name: string; minutes: number; line: string }[] = [
  { id: 'pause', name: 'Pause', minutes: 5, line: 'Settle immediate tension.' },
  { id: 'clarity', name: 'Clarity', minutes: 12, line: 'Organize thoughts and sharpen focus.' },
  { id: 'space', name: 'Space', minutes: 25, line: 'Clear mental clutter and make room to breathe.' },
  { id: 'release', name: 'Release', minutes: 50, line: "Let go of what you've been carrying." },
];

export const sessionInfo = (id: string) => SESSIONS.find((s) => s.id === id) ?? SESSIONS[0];

export const STARTERS = [
  "What's taking up the most space in your mind?",
  'What keeps returning?',
  "What haven't you said?",
  'What feels unfinished?',
  'What are you trying not to think about?',
  'Write the thing you keep rehearsing in your head.',
  "You don't have to understand it. Start describing it.",
  "What are you carrying that you don't want to carry right now?",
  'What needs to get out of your head?',
  "What are you feeling that you haven't given words to yet?",
];

export const COMPANION_PHRASES = [
  "Keep going. There's no wrong way.",
  "You don't have to make sense yet.",
  'Stay with it a little longer.',
  'What else is there?',
  'It can be messy here.',
  'Nobody is reading this.',
  'Say it plainly.',
  'Follow the thought wherever it goes.',
  "You're allowed to repeat yourself.",
  'Let the next sentence come.',
  'Notice what you keep circling.',
  'Slower is fine.',
];

export const TIME_UP_PHRASE = "That's the time. Finish your thought.";

export const AFFIRMATION = "You don't need to solve it now, just give it a place to go.";

export const HOW_TO_WRITE = {
  paragraphs: [
    'Write down whatever is on your mind.',
    "A thought. A worry. Something that happened today or something you keep coming back to. Maybe something that's been on your mind for a while or something that just popped into your head.",
    "You don't have to write well. You don't even have to know what you're trying to say. Just put it down.",
    'It can be messy. It can be repetitive. You can change direction halfway through.',
    "You don't need to make sense of it yet.",
    'Think of it less as writing and more as emptying your mind.',
  ],
  maybeIntro: 'Maybe you start with:',
  examples: [
    "I don't know what to write.",
    'I keep thinking about that conversation.',
    "Maybe I'm overthinking it.",
    "I don't know why this still bothers me.",
  ],
  closing: [
    "That's enough.",
    "You're not here to solve anything or find an answer just yet.",
    "There's no right way to do this. Just start where you are.",
  ],
};

export type ShiftArea = 'mind' | 'body' | 'attention';
export type ShiftValue = 'better' | 'same' | 'worse';

export const SHIFT_AREAS: { id: ShiftArea; name: string; options: Record<ShiftValue, string> }[] = [
  { id: 'mind', name: 'Mind', options: { better: 'Quieter', same: 'Same', worse: 'More active' } },
  { id: 'body', name: 'Body', options: { better: 'More settled', same: 'Same', worse: 'More tense' } },
  {
    id: 'attention',
    name: 'Attention',
    options: { better: 'Clearer', same: 'Same', worse: 'Still scattered' },
  },
];

export type SoundId = 'none' | 'rain' | 'brown' | 'drone';

export const SOUNDS: { id: SoundId; name: string }[] = [
  { id: 'none', name: 'Silence' },
  { id: 'rain', name: 'Soft rain' },
  { id: 'brown', name: 'Brown noise' },
  { id: 'drone', name: 'Low drone' },
];

export type BreathPhaseKind = 'in' | 'hold' | 'out' | 'rest';

export type BreathPattern = {
  id: string;
  name: string;
  rhythm: string;
  line: string;
  phases: { kind: BreathPhaseKind; seconds: number }[];
};

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'settle',
    name: 'Settle',
    rhythm: '4 · 6',
    line: 'A longer exhale tells the body it is safe.',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'out', seconds: 6 },
    ],
  },
  {
    id: 'box',
    name: 'Box',
    rhythm: '4 · 4 · 4 · 4',
    line: 'Four even sides. Steadies a racing mind.',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 4 },
      { kind: 'out', seconds: 4 },
      { kind: 'rest', seconds: 4 },
    ],
  },
  {
    id: 'deep',
    name: 'Deep',
    rhythm: '4 · 7 · 8',
    line: 'A slow reset, good before sleep.',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 7 },
      { kind: 'out', seconds: 8 },
    ],
  },
  {
    id: 'even',
    name: 'Even',
    rhythm: '5 · 5',
    line: 'Six breaths a minute. Quiet and balanced.',
    phases: [
      { kind: 'in', seconds: 5 },
      { kind: 'out', seconds: 5 },
    ],
  },
];

export const PHASE_LABEL: Record<BreathPhaseKind, string> = {
  in: 'Breathe in',
  hold: 'Hold',
  out: 'Breathe out',
  rest: 'Rest',
};

export const METHOD = {
  intro:
    'Unload is a way of emptying your head onto a page. Not a journal, not a diary — a place for thoughts to go so you can stop carrying them.',
  steps: [
    {
      title: 'Notice',
      body: 'Say what is here right now. Give it a name if you can — one word is enough. Naming a feeling makes it smaller.',
    },
    {
      title: 'Empty',
      body: 'Write without stopping for a set time. Do not edit, do not judge, do not reread. Messy and repetitive is exactly right.',
    },
    {
      title: 'Leave it',
      body: 'When the time is up, keep the page or let it go. Then, if you like, notice what shifted in your mind, body and attention.',
    },
  ],
  capture:
    'Some thoughts arrive at the wrong moment. Capture them in one sentence and come back when you have time to unload them properly.',
  disclaimer:
    'Unload is a tool for working on yourself. It is not a replacement for therapy or medical care. If you are in crisis, contact local emergency services or a crisis line in your country.',
};
