import { useLocales } from 'expo-localization';
import { createContext, useContext, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { en, type Dict } from './en';
import { pl } from './pl';

// Planned: 'de' | 'fr' | 'es' | 'nb'. Add the dictionary here and the locale in app.json.
export type Lang = 'en' | 'pl';

const DICTS: Record<Lang, Dict> = { en, pl };
const FALLBACK: Lang = 'en';

// Devices report Norwegian as nb, nn or no; all of them will map to one dictionary.
const ALIASES: Record<string, string> = { no: 'nb', nn: 'nb' };

const isLang = (code: string): code is Lang => code in DICTS;

// First of the person's preferred languages that Unload speaks, otherwise English.
export function pickLanguage(locales: { languageCode: string | null }[]): Lang {
  for (const locale of locales) {
    const raw = locale.languageCode?.toLowerCase();
    if (!raw) continue;
    const code = ALIASES[raw] ?? raw;
    if (isLang(code)) return code;
  }
  return FALLBACK;
}

// Web preview only, in development: `?lang=pl` shows a language without changing the browser.
const devOverride = (() => {
  if (!__DEV__ || Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const code = new URLSearchParams(window.location.search).get('lang');
  return code && isLang(code) ? code : null;
})();

type I18n = { lang: Lang; t: Dict };

const I18nContext = createContext<I18n>({ lang: FALLBACK, t: DICTS[FALLBACK] });

export function I18nProvider({ children }: { children: ReactNode }) {
  const locales = useLocales();
  const lang = devOverride ?? pickLanguage(locales);
  return <I18nContext.Provider value={{ lang, t: DICTS[lang] }}>{children}</I18nContext.Provider>;
}

export const useT = () => useContext(I18nContext).t;
export const useLang = () => useContext(I18nContext).lang;

export type { Dict };
