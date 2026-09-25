import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkPin } from '@/lib/pin';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';

import { PIN_LENGTH, PinDots, PinPad } from './PinPad';
import { T } from './T';

// Covers the app with a PIN screen on launch and whenever it returns from the background.
export function LockGate({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const { pinEnabled } = useStore().data.settings;
  const [locked, setLocked] = useState(pinEnabled);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);
  const wasEnabled = useRef(pinEnabled);

  // Turning the PIN on inside settings must not lock the person out mid-session.
  useEffect(() => {
    if (!pinEnabled) setLocked(false);
    wasEnabled.current = pinEnabled;
  }, [pinEnabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' && wasEnabled.current) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  const onDigit = async (d: string) => {
    const next = (entry + d).slice(0, PIN_LENGTH);
    setError(false);
    setEntry(next);
    if (next.length === PIN_LENGTH) {
      if (await checkPin(next)) {
        setLocked(false);
        setEntry('');
      } else {
        setError(true);
        setTimeout(() => setEntry(''), 400);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      {locked && (
        <SafeAreaView
          style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, justifyContent: 'center', zIndex: 100, elevation: 100 }]}>
          <T variant="label" center>
            Unload
          </T>
          <T variant="title" center style={{ marginTop: 12 }}>
            {error ? 'Try again' : 'Enter your PIN'}
          </T>
          <PinDots length={entry.length} error={error} />
          <PinPad onDigit={onDigit} onDelete={() => setEntry((e) => e.slice(0, -1))} />
        </SafeAreaView>
      )}
    </View>
  );
}
