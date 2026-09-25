import type { CheckinState, SessionType, ShiftArea, ShiftValue, SoundId } from '@/content/copy';

export type Capture = {
  id: string;
  text: string;
  createdAt: number;
  status: 'waiting' | 'explored';
  sessionId?: string;
};

export type Checkin = {
  id: string;
  state: CheckinState;
  name?: string;
  at: number;
};

export type Session = {
  id: string;
  type: SessionType;
  startedAt: number;
  endedAt: number;
  plannedMinutes: number;
  text: string;
  wordCount: number;
  // Letting go erases the words; the session itself stays in the calendar.
  released: boolean;
  checkinId?: string;
  captureId?: string;
  shift?: Partial<Record<ShiftArea, ShiftValue>>;
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type SessionOptions = {
  starters: boolean;
  companion: boolean;
  sound: SoundId;
  breath: boolean;
};

export type Settings = {
  name: string;
  email: string;
  theme: ThemeMode;
  // When on, the options flagged in `askEachTime` are chosen before every session.
  customizeEachSession: boolean;
  askEachTime: Record<keyof SessionOptions, boolean>;
  defaults: SessionOptions;
  showHowToWrite: boolean;
  noticeShift: boolean;
  pinEnabled: boolean;
  onboardedAt?: number;
};

export type AppData = {
  captures: Capture[];
  checkins: Checkin[];
  sessions: Session[];
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  email: '',
  theme: 'system',
  customizeEachSession: false,
  askEachTime: { starters: true, companion: true, sound: true, breath: true },
  defaults: { starters: true, companion: true, sound: 'none', breath: false },
  showHowToWrite: true,
  noticeShift: true,
  pinEnabled: false,
};

export const EMPTY_DATA: AppData = {
  captures: [],
  checkins: [],
  sessions: [],
  settings: DEFAULT_SETTINGS,
};
