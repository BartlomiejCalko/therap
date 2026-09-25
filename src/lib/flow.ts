import { router } from 'expo-router';

import type { SessionType } from '@/content/copy';
import type { SessionOptions, Settings } from '@/store/types';

export type FlowContext = { checkinId?: string; captureId?: string };

export type SessionParams = {
  type: SessionType;
  checkinId?: string;
  captureId?: string;
  starters: '1' | '0';
  companion: '1' | '0';
  sound: SessionOptions['sound'];
  breath: '1' | '0';
};

const clean = <T extends Record<string, string | undefined>>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>;

export const optionsToParams = (o: SessionOptions) => ({
  starters: o.starters ? '1' : '0',
  companion: o.companion ? '1' : '0',
  sound: o.sound,
  breath: o.breath ? '1' : '0',
});

// Picks the next step after a session is chosen: design it, arrive with a breath, or write.
export function beginSession(type: SessionType, ctx: FlowContext, settings: Settings) {
  const asks = settings.customizeEachSession && Object.values(settings.askEachTime).some(Boolean);
  const base = clean({ type, ...ctx });
  if (asks) {
    router.push({ pathname: '/session/setup', params: base });
    return;
  }
  goToSession({ ...base, ...optionsToParams(settings.defaults) }, settings.defaults.breath);
}

export function goToSession(params: Record<string, string>, breathFirst: boolean) {
  router.push({ pathname: breathFirst ? '/session/ground' : '/session/write', params });
}
