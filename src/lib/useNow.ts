import { useEffect, useState } from 'react';

// The current time, refreshed on an interval — enough for clocks and time-of-day scenes.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
