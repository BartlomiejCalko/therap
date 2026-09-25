import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';

import type { CheckinState, ShiftArea, ShiftValue } from '@/content/copy';
import { makeId } from '@/lib/id';

import {
  DEFAULT_SETTINGS,
  EMPTY_DATA,
  type AppData,
  type Capture,
  type Checkin,
  type Session,
  type Settings,
} from './types';

const STORAGE_KEY = 'unload/v1';

type Action =
  | { type: 'hydrate'; data: AppData }
  | { type: 'addCapture'; capture: Capture }
  | { type: 'deleteCapture'; id: string }
  | { type: 'addCheckin'; checkin: Checkin }
  | { type: 'addSession'; session: Session }
  | { type: 'releaseSession'; id: string }
  | { type: 'deleteSession'; id: string }
  | { type: 'setShift'; id: string; shift: Partial<Record<ShiftArea, ShiftValue>> }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'reset' };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'hydrate':
      return action.data;
    case 'addCapture':
      return { ...state, captures: [action.capture, ...state.captures] };
    case 'deleteCapture':
      return { ...state, captures: state.captures.filter((c) => c.id !== action.id) };
    case 'addCheckin':
      return { ...state, checkins: [action.checkin, ...state.checkins] };
    case 'addSession': {
      const { session } = action;
      return {
        ...state,
        sessions: [session, ...state.sessions],
        captures: session.captureId
          ? state.captures.map((c) =>
              c.id === session.captureId ? { ...c, status: 'explored', sessionId: session.id } : c,
            )
          : state.captures,
      };
    }
    case 'releaseSession':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, text: '', released: true } : s,
        ),
      };
    case 'deleteSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };
    case 'setShift':
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.id ? { ...s, shift: action.shift } : s)),
      };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'reset':
      return EMPTY_DATA;
  }
}

function withDefaults(raw: Partial<AppData> | null): AppData {
  if (!raw) return EMPTY_DATA;
  const settings = { ...DEFAULT_SETTINGS, ...raw.settings };
  settings.defaults = { ...DEFAULT_SETTINGS.defaults, ...raw.settings?.defaults };
  settings.askEachTime = { ...DEFAULT_SETTINGS.askEachTime, ...raw.settings?.askEachTime };
  return {
    captures: raw.captures ?? [],
    checkins: raw.checkins ?? [],
    sessions: raw.sessions ?? [],
    settings,
  };
}

type Store = {
  ready: boolean;
  data: AppData;
  addCapture: (text: string) => void;
  deleteCapture: (id: string) => void;
  addCheckin: (state: CheckinState, name?: string) => string;
  addSession: (session: Omit<Session, 'id' | 'released'>) => string;
  releaseSession: (id: string) => void;
  deleteSession: (id: string) => void;
  setShift: (id: string, shift: Partial<Record<ShiftArea, ShiftValue>>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => dispatch({ type: 'hydrate', data: withDefaults(json ? JSON.parse(json) : null) }))
      .catch(() => dispatch({ type: 'hydrate', data: EMPTY_DATA }))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
    }, 250);
  }, [data, ready]);

  const store: Store = {
    ready,
    data,
    addCapture: (text) =>
      dispatch({
        type: 'addCapture',
        capture: { id: makeId(), text: text.trim(), createdAt: Date.now(), status: 'waiting' },
      }),
    deleteCapture: (id) => dispatch({ type: 'deleteCapture', id }),
    addCheckin: (state, name) => {
      const id = makeId();
      dispatch({ type: 'addCheckin', checkin: { id, state, name: name?.trim() || undefined, at: Date.now() } });
      return id;
    },
    addSession: (session) => {
      const id = makeId();
      dispatch({ type: 'addSession', session: { ...session, id, released: false } });
      return id;
    },
    releaseSession: (id) => dispatch({ type: 'releaseSession', id }),
    deleteSession: (id) => dispatch({ type: 'deleteSession', id }),
    setShift: (id, shift) => dispatch({ type: 'setShift', id, shift }),
    updateSettings: (patch) => dispatch({ type: 'updateSettings', patch }),
    resetAll: () => dispatch({ type: 'reset' }),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
