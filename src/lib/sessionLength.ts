import type { Dict } from '@/i18n';
import type { Session } from '@/store/types';

// "25 min" for a session that ran its course or ended early; "25 min · extended by 7 min"
// when the person chose to keep writing past the planned time.
export function sessionLength(session: Session, t: Dict) {
  const actual = Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000));
  if (!session.extendedSeconds) return t.common.minutes(actual);
  const extra = Math.max(1, Math.round(session.extendedSeconds / 60));
  return `${t.common.minutes(session.plannedMinutes)} · ${t.common.extendedBy(extra)}`;
}
