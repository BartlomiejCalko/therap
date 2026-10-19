import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

// Work that would compete with a screen transition (starting the sky's animations and the state
// loops, pausing them again) waits until the transition is over: a screen becomes "settled" a
// moment after it comes into view, and stays settled a moment after it leaves. Both delays sit
// comfortably after the longest transition (a native push with its spring), so nothing lands
// at the very end of a slide.
const SETTLE_IN_MS = 700;
const SETTLE_OUT_MS = 900;

export function useSettled() {
  const [settled, setSettled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useFocusEffect(
    useCallback(() => {
      // Only the latest change of focus counts: a pending one is always replaced.
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSettled(true), SETTLE_IN_MS);
      return () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setSettled(false), SETTLE_OUT_MS);
      };
    }, []),
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return settled;
}
