import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  CHECKIN_STATES,
  SESSIONS,
  SHIFT_AREAS,
  sessionInfo,
  stateLabel,
  type ShiftValue,
} from '@/content/copy';
import {
  addDays,
  DAY_MS,
  groupByDay,
  isSameDay,
  longDate,
  monthName,
  monthShort,
  startOfDay,
  startOfWeek,
  timeOfDay,
} from '@/lib/date';
import { tap } from '@/lib/haptics';
import type { Checkin, Session } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

import { SessionMark } from './SessionMark';
import { T } from './T';
import { CircleButton, Hairline, SectionLabel } from './ui';

const minutesOf = (s: Session) => Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000));

// ---------- Row ----------

export function SessionRow({ session, checkin }: { session: Session; checkin?: Checkin }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push(`/entry/${session.id}`);
      }}
      style={({ pressed }) => [styles.sessionRow, { opacity: pressed ? 0.55 : 1 }]}>
      <T variant="label" style={{ width: 44, marginTop: 4 }}>
        {timeOfDay(session.startedAt)}
      </T>
      <SessionMark type={session.type} size={24} />
      <View style={{ flex: 1, gap: 4 }}>
        <T variant="medium">
          {sessionInfo(session.type).name}
          <T variant="small" tone="faint">
            {'  '}
            {minutesOf(session)} min
          </T>
        </T>
        {session.released ? (
          <T variant="italic" tone="soft" style={{ fontSize: 16, lineHeight: 22 }}>
            Let go.
          </T>
        ) : (
          <T variant="serifSmall" tone="soft" numberOfLines={2}>
            {session.text}
          </T>
        )}
        {checkin && (
          <T variant="small" tone="faint">
            {stateLabel(checkin.state)}
            {checkin.name ? ` — ${checkin.name}` : ''}
          </T>
        )}
      </View>
    </Pressable>
  );
}

function SessionList({ sessions, checkins }: { sessions: Session[]; checkins: Checkin[] }) {
  return (
    <View>
      {sessions.map((s, i) => (
        <View key={s.id}>
          {i > 0 && <Hairline />}
          <SessionRow session={s} checkin={checkins.find((c) => c.id === s.checkinId)} />
        </View>
      ))}
    </View>
  );
}

function EmptyNote({ children }: { children: string }) {
  return (
    <T variant="italic" tone="faint" center style={{ marginTop: space.xl, fontSize: 17 }}>
      {children}
    </T>
  );
}

// ---------- Timeline ----------

export function Timeline({ sessions, checkins }: { sessions: Session[]; checkins: Checkin[] }) {
  if (sessions.length === 0) return <EmptyNote>Your first session will appear here.</EmptyNote>;
  return (
    <View>
      {groupByDay(sessions, (s) => s.startedAt).map((g) => (
        <View key={g.key}>
          <SectionLabel>{longDate(g.time)}</SectionLabel>
          <SessionList sessions={g.items} checkins={checkins} />
        </View>
      ))}
    </View>
  );
}

// ---------- Week ----------

const dotSize = (minutes: number) => 6 + Math.sqrt(minutes) * 2.2;

export function WeekView({ sessions, checkins }: { sessions: Session[]; checkins: Checkin[] }) {
  const { c } = useTheme();
  const [start, setStart] = useState(() => startOfWeek(Date.now()));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = addDays(start, 7).getTime();
  const inWeek = sessions.filter((s) => s.startedAt >= start.getTime() && s.startedAt < end);
  const isCurrent = startOfWeek(Date.now()).getTime() === start.getTime();

  const range = `${start.getDate()} ${monthShort(start.getMonth())} – ${days[6].getDate()} ${monthShort(days[6].getMonth())}`;

  return (
    <View>
      <View style={styles.nav}>
        <CircleButton icon="back" label="Previous week" size={34} onPress={() => setStart(addDays(start, -7))} />
        <T variant="label" tone="ink">
          {range}
        </T>
        <View style={{ opacity: isCurrent ? 0.25 : 1 }}>
          <CircleButton
            icon="arrow"
            label="Next week"
            size={34}
            onPress={() => !isCurrent && setStart(addDays(start, 7))}
          />
        </View>
      </View>

      <View style={styles.week}>
        {days.map((d) => {
          const daySessions = inWeek.filter((s) => isSameDay(s.startedAt, d));
          const total = daySessions.reduce((sum, s) => sum + minutesOf(s), 0);
          const today = isSameDay(d, Date.now());
          return (
            <View key={d.toISOString()} style={styles.weekCol}>
              <View style={[styles.weekStack, { borderBottomColor: c.hairline }]}>
                {daySessions.map((s) => {
                  const size = dotSize(minutesOf(s));
                  return (
                    <View
                      key={s.id}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: s.released ? 'transparent' : c.ink,
                        borderWidth: 1,
                        borderColor: c.ink,
                      }}
                    />
                  );
                })}
              </View>
              <T variant="label" tone={today ? 'ink' : 'faint'} style={{ marginTop: 10 }}>
                {'MTWTFSS'[(d.getDay() + 6) % 7]}
              </T>
              <T variant="small" tone={today ? 'ink' : 'faint'}>
                {d.getDate()}
              </T>
              <T variant="label" style={{ marginTop: 4, minHeight: 14 }}>
                {total ? `${total}m` : ''}
              </T>
            </View>
          );
        })}
      </View>
      <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
        Filled circles were kept. Open circles were let go.
      </T>

      {inWeek.length === 0 ? (
        <EmptyNote>A quiet week.</EmptyNote>
      ) : (
        <>
          <SectionLabel>This week</SectionLabel>
          <SessionList sessions={inWeek} checkins={checkins} />
        </>
      )}
    </View>
  );
}

// ---------- Month ----------

export function MonthView({ sessions, checkins }: { sessions: Session[]; checkins: Checkin[] }) {
  const { c } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(() => startOfDay(Date.now()));

  const first = new Date(month.y, month.m, 1);
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.y, month.m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const isCurrent = month.y === now.getFullYear() && month.m === now.getMonth();
  const shift = (delta: number) => {
    const d = new Date(month.y, month.m + delta, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const selectedSessions = sessions.filter((s) => isSameDay(s.startedAt, selected));

  return (
    <View>
      <View style={styles.nav}>
        <CircleButton icon="back" label="Previous month" size={34} onPress={() => shift(-1)} />
        <T variant="heading">
          {monthName(month.m)} <T variant="heading" tone="faint">{month.y}</T>
        </T>
        <View style={{ opacity: isCurrent ? 0.25 : 1 }}>
          <CircleButton icon="arrow" label="Next month" size={34} onPress={() => !isCurrent && shift(1)} />
        </View>
      </View>

      <View style={styles.monthGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={styles.monthCell}>
            <T variant="label">{d}</T>
          </View>
        ))}
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.monthCell} />;
          const count = sessions.filter((s) => isSameDay(s.startedAt, d)).length;
          const isSelected = isSameDay(d, selected);
          const future = d.getTime() > Date.now();
          return (
            <Pressable
              key={i}
              disabled={future}
              onPress={() => {
                tap();
                setSelected(startOfDay(d));
              }}
              style={styles.monthCell}>
              <View
                style={[
                  styles.dayCircle,
                  isSelected && { borderColor: c.ink, borderWidth: 1 },
                  isSameDay(d, Date.now()) && !isSelected && { backgroundColor: c.surfaceAlt },
                ]}>
                <T variant="small" tone={future ? 'faint' : 'ink'}>
                  {d.getDate()}
                </T>
              </View>
              <View style={styles.dayDots}>
                {Array.from({ length: Math.min(count, 3) }, (_, k) => (
                  <View key={k} style={[styles.dayDot, { backgroundColor: c.ink }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionLabel>{longDate(selected)}</SectionLabel>
      {selectedSessions.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          No sessions this day.
        </T>
      ) : (
        <SessionList sessions={selectedSessions} checkins={checkins} />
      )}
    </View>
  );
}

// ---------- Insights ----------

const SHIFT_WORDS: Record<string, Record<ShiftValue, string>> = Object.fromEntries(
  SHIFT_AREAS.map((a) => [
    a.id,
    { better: a.options.better.toLowerCase(), same: 'same', worse: a.options.worse.toLowerCase() },
  ]),
);

export function Insights({
  sessions,
  checkins,
  noticeShift,
}: {
  sessions: Session[];
  checkins: Checkin[];
  noticeShift: boolean;
}) {
  const { c } = useTheme();
  const minutes = sessions.reduce((sum, s) => sum + minutesOf(s), 0);
  const released = sessions.filter((s) => s.released).length;
  const stateCounts = CHECKIN_STATES.map((st) => ({
    ...st,
    count: checkins.filter((x) => x.state === st.id).length,
  }));
  const maxState = Math.max(1, ...stateCounts.map((s) => s.count));
  const typeCounts = SESSIONS.map((t) => ({ ...t, count: sessions.filter((s) => s.type === t.id).length }));
  const favourite = [...typeCounts].sort((a, b) => b.count - a.count)[0];
  const withShift = sessions.filter((s) => s.shift && Object.values(s.shift).some(Boolean));
  const last30 = sessions.filter((s) => s.startedAt > Date.now() - 30 * DAY_MS).length;

  return (
    <View>
      <View style={[styles.stats, { borderColor: c.hairline }]}>
        {[
          { n: sessions.length, label: 'Sessions' },
          { n: minutes, label: 'Minutes' },
          { n: released, label: 'Let go' },
        ].map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: c.hairline }]}>
            <T variant="display" center>
              {s.n}
            </T>
            <T variant="label" center>
              {s.label}
            </T>
          </View>
        ))}
      </View>
      {favourite.count > 0 && (
        <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
          {last30} in the last 30 days · most often {favourite.name}
        </T>
      )}

      <SectionLabel>What brings you here</SectionLabel>
      {checkins.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          Choose what&apos;s on your mind on Today to see it here.
        </T>
      ) : (
        <View style={{ gap: space.md }}>
          {stateCounts.map((s) => (
            <View key={s.id} style={{ gap: 6 }}>
              <View style={styles.barLabel}>
                <T variant="serifSmall">{s.label}</T>
                <T variant="label" tone="ink">
                  {s.count}
                </T>
              </View>
              <View style={[styles.barTrack, { backgroundColor: c.hairline }]}>
                <View style={{ height: 2, width: `${(s.count / maxState) * 100}%`, backgroundColor: c.ink }} />
              </View>
            </View>
          ))}
        </View>
      )}

      <SectionLabel>Your shifts</SectionLabel>
      {withShift.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          {noticeShift
            ? 'After a session, notice what shifted to see it here.'
            : 'Turn on “Notice the shift” in Settings to see this.'}
        </T>
      ) : (
        <View style={{ gap: space.lg }}>
          {SHIFT_AREAS.map((area) => {
            const counts = (['better', 'same', 'worse'] as ShiftValue[]).map((v) => ({
              v,
              n: withShift.filter((s) => s.shift?.[area.id] === v).length,
            }));
            const total = Math.max(1, counts.reduce((sum, x) => sum + x.n, 0));
            const tones = [c.ink, c.inkFaint, c.hairline];
            return (
              <View key={area.id} style={{ gap: 8 }}>
                <T variant="heading" style={{ fontSize: 19 }}>
                  {area.name}
                </T>
                <T variant="small" tone="soft">
                  {counts.map((x) => `${x.n} ${SHIFT_WORDS[area.id][x.v]}`).join(' · ')}
                </T>
                <View style={styles.shiftBar}>
                  {counts.map((x, i) =>
                    x.n ? <View key={x.v} style={{ flex: x.n / total, backgroundColor: tones[i] }} /> : null,
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sessionRow: { flexDirection: 'row', gap: space.md, paddingVertical: space.md, alignItems: 'flex-start' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.lg },
  week: { flexDirection: 'row', marginTop: space.xl },
  weekCol: { flex: 1, alignItems: 'center' },
  weekStack: {
    height: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.lg },
  monthCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4, height: 50 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayDots: { flexDirection: 'row', gap: 2, marginTop: 3, height: 4 },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  stats: {
    flexDirection: 'row',
    marginTop: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: space.lg,
  },
  stat: { flex: 1, gap: 4 },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  barTrack: { height: 2 },
  shiftBar: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' },
});
