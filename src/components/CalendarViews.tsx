import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CHECKIN_STATES, SESSIONS, SHIFT_AREAS, SHIFT_VALUES } from '@/content/copy';
import { useT } from '@/i18n';
import { addDays, DAY_MS, groupByDay, isSameDay, startOfDay, startOfWeek, timeOfDay } from '@/lib/date';
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
  const t = useT();
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
          {t.sessions[session.type].name}
          <T variant="small" tone="faint">
            {'  '}
            {t.common.minutes(minutesOf(session))}
          </T>
        </T>
        {session.released ? (
          <T variant="italic" tone="soft" style={{ fontSize: 16, lineHeight: 22 }}>
            {t.common.letGo}
          </T>
        ) : (
          <T variant="serifSmall" tone="soft" numberOfLines={2}>
            {session.text}
          </T>
        )}
        {checkin && (
          <T variant="small" tone="faint">
            {t.states[checkin.state]}
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
  const t = useT();
  if (sessions.length === 0) return <EmptyNote>{t.calendar.firstSession}</EmptyNote>;
  return (
    <View>
      {groupByDay(sessions, (s) => s.startedAt).map((g) => (
        <View key={g.key}>
          <SectionLabel>{t.dates.long(new Date(g.time))}</SectionLabel>
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
  const t = useT();
  const [start, setStart] = useState(() => startOfWeek(Date.now()));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = addDays(start, 7).getTime();
  const inWeek = sessions.filter((s) => s.startedAt >= start.getTime() && s.startedAt < end);
  const isCurrent = startOfWeek(Date.now()).getTime() === start.getTime();

  return (
    <View>
      <View style={styles.nav}>
        <CircleButton icon="back" label={t.calendar.prevWeek} size={34} onPress={() => setStart(addDays(start, -7))} />
        <T variant="label" tone="ink">
          {t.dates.range(start, days[6])}
        </T>
        <View style={{ opacity: isCurrent ? 0.25 : 1 }}>
          <CircleButton
            icon="arrow"
            label={t.calendar.nextWeek}
            size={34}
            onPress={() => !isCurrent && setStart(addDays(start, 7))}
          />
        </View>
      </View>

      <View style={styles.week}>
        {days.map((d, i) => {
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
                {t.dates.initials[i]}
              </T>
              <T variant="small" tone={today ? 'ink' : 'faint'}>
                {d.getDate()}
              </T>
              <T variant="label" style={{ marginTop: 4, minHeight: 14 }}>
                {total ? t.calendar.dayMinutes(total) : ''}
              </T>
            </View>
          );
        })}
      </View>
      <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
        {t.calendar.weekLegend}
      </T>

      {inWeek.length === 0 ? (
        <EmptyNote>{t.calendar.quietWeek}</EmptyNote>
      ) : (
        <>
          <SectionLabel>{t.calendar.thisWeek}</SectionLabel>
          <SessionList sessions={inWeek} checkins={checkins} />
        </>
      )}
    </View>
  );
}

// ---------- Month ----------

export function MonthView({ sessions, checkins }: { sessions: Session[]; checkins: Checkin[] }) {
  const { c } = useTheme();
  const t = useT();
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
        <CircleButton icon="back" label={t.calendar.prevMonth} size={34} onPress={() => shift(-1)} />
        <T variant="heading">
          {t.dates.month(month.m)}{' '}
          <T variant="heading" tone="faint">
            {month.y}
          </T>
        </T>
        <View style={{ opacity: isCurrent ? 0.25 : 1 }}>
          <CircleButton icon="arrow" label={t.calendar.nextMonth} size={34} onPress={() => !isCurrent && shift(1)} />
        </View>
      </View>

      <View style={styles.monthGrid}>
        {t.dates.initials.map((d, i) => (
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

      <SectionLabel>{t.dates.long(selected)}</SectionLabel>
      {selectedSessions.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          {t.calendar.noSessionsDay}
        </T>
      ) : (
        <SessionList sessions={selectedSessions} checkins={checkins} />
      )}
    </View>
  );
}

// ---------- Insights ----------

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
  const t = useT();
  const minutes = sessions.reduce((sum, s) => sum + minutesOf(s), 0);
  const released = sessions.filter((s) => s.released).length;
  const stateCounts = CHECKIN_STATES.map((id) => ({ id, count: checkins.filter((x) => x.state === id).length }));
  const maxState = Math.max(1, ...stateCounts.map((s) => s.count));
  const typeCounts = SESSIONS.map((s) => ({ id: s.id, count: sessions.filter((x) => x.type === s.id).length }));
  const favourite = [...typeCounts].sort((a, b) => b.count - a.count)[0];
  const withShift = sessions.filter((s) => s.shift && Object.values(s.shift).some(Boolean));
  const last30 = sessions.filter((s) => s.startedAt > Date.now() - 30 * DAY_MS).length;

  return (
    <View>
      <View style={[styles.stats, { borderColor: c.hairline }]}>
        {[
          { n: sessions.length, label: t.calendar.stats.sessions },
          { n: minutes, label: t.calendar.stats.minutes },
          { n: released, label: t.calendar.stats.letGo },
        ].map((s, i) => (
          <View
            key={s.label}
            style={[styles.stat, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: c.hairline }]}>
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
          {t.calendar.recentLine(last30, t.sessions[favourite.id].name)}
        </T>
      )}

      <SectionLabel>{t.calendar.brings}</SectionLabel>
      {checkins.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          {t.calendar.bringsEmpty}
        </T>
      ) : (
        <View style={{ gap: space.md }}>
          {stateCounts.map((s) => (
            <View key={s.id} style={{ gap: 6 }}>
              <View style={styles.barLabel}>
                <T variant="serifSmall">{t.states[s.id]}</T>
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

      <SectionLabel>{t.calendar.shifts}</SectionLabel>
      {withShift.length === 0 ? (
        <T variant="italic" tone="faint" style={{ fontSize: 17 }}>
          {noticeShift ? t.calendar.shiftsEmpty : t.calendar.shiftsOff}
        </T>
      ) : (
        <View style={{ gap: space.lg }}>
          {SHIFT_AREAS.map((area) => {
            const copy = t.shift.areas[area];
            const counts = SHIFT_VALUES.map((v) => ({
              v,
              n: withShift.filter((s) => s.shift?.[area] === v).length,
            }));
            const total = Math.max(1, counts.reduce((sum, x) => sum + x.n, 0));
            const tones = [c.ink, c.inkFaint, c.hairline];
            return (
              <View key={area} style={{ gap: 8 }}>
                <T variant="heading" style={{ fontSize: 19 }}>
                  {copy.name}
                </T>
                <T variant="small" tone="soft">
                  {t.shift.summary(counts.map((x) => ({ label: copy[x.v], count: x.n })))}
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
