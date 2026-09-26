// Date arithmetic. Names of days and months live in the language dictionaries (t.dates).
import type { Dict } from '@/i18n/en';

export const DAY_MS = 24 * 60 * 60 * 1000;

export const pad = (n: number) => String(n).padStart(2, '0');

export const startOfDay = (t: number | Date) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isSameDay = (a: number | Date, b: number | Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();

// Weeks start on Monday.
export const startOfWeek = (t: number | Date) => {
  const d = startOfDay(t);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
};

export const addDays = (t: number | Date, days: number) => {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d;
};

export const timeOfDay = (t: number) => {
  const d = new Date(t);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// "Today", "Yesterday", or a short date — in the current language.
export function dayLabel(t: number, dates: Dict['dates']) {
  const now = Date.now();
  if (isSameDay(t, now)) return dates.today;
  if (isSameDay(t, now - DAY_MS)) return dates.yesterday;
  return dates.short(new Date(t));
}

export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function groupByDay<T>(items: T[], getTime: (item: T) => number) {
  const groups: { key: string; time: number; items: T[] }[] = [];
  for (const item of items) {
    const t = getTime(item);
    const key = startOfDay(t).toISOString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, time: t, items: [item] });
  }
  return groups;
}
