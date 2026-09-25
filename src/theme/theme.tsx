import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useStore } from '@/store/store';

import { palettes, type Palette } from './tokens';

type Theme = { c: Palette; scheme: 'light' | 'dark' };

const ThemeContext = createContext<Theme>({ c: palettes.light, scheme: 'light' });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useStore().data.settings.theme;
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return (
    <ThemeContext.Provider value={{ c: palettes[scheme], scheme }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
