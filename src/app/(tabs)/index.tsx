import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { DayWindow } from '@/components/DayWindow';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { CircleButton, Screen, SectionLabel } from '@/components/ui';
import { CHECKIN_STATES, type CheckinState } from '@/content/copy';
import { greeting, longDate } from '@/lib/date';
import { tap } from '@/lib/haptics';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space, type Palette } from '@/theme/tokens';

const stateTone = (c: Palette, id: CheckinState) =>
  ({ 'too-much': c.pastel.peach, scattered: c.pastel.lavender, stuck: c.pastel.sage, weighing: c.pastel.mist })[id];

export default function Today() {
  const { c } = useTheme();
  const now = useNow();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();

  return (
    <Screen withTabBar texture>
      <View style={styles.header}>
        <T variant="label">{longDate(now)}</T>
        <CircleButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <DayWindow
        now={now}
        title={`${greeting(now)}${firstName ? `,\n${firstName}` : ''}`}
        subtitle="Your thoughts have somewhere to go."
      />

      <T variant="heading" style={styles.question}>
        What&apos;s on your mind right now?
      </T>
      <View style={styles.grid}>
        {CHECKIN_STATES.map((state) => (
          <Pressable
            key={state.id}
            accessibilityRole="button"
            onPress={() => {
              tap();
              router.push({ pathname: '/checkin', params: { state: state.id } });
            }}
            style={({ pressed }) => [
              styles.stateTile,
              { backgroundColor: stateTone(c, state.id), opacity: pressed ? 0.7 : 1 },
            ]}>
            <T variant="serif" style={styles.stateText}>
              {state.label}
            </T>
            <View style={[styles.miniCircle, { backgroundColor: c.veil }]}>
              <Icon name="arrow" size={14} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            tap();
            router.push('/choose');
          }}
          style={({ pressed }) => [styles.actionCard, { backgroundColor: c.ink, flex: 1.2, opacity: pressed ? 0.8 : 1 }]}>
          <Icon name="unload" size={24} color={c.onInk} />
          <View>
            <T variant="medium" tone="onInk">
              Choose a session
            </T>
            <T variant="small" tone="onInk" style={{ opacity: 0.65, marginTop: 2 }}>
              Straight to writing
            </T>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            tap();
            router.push('/how-to-write');
          }}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: c.surface, borderColor: c.hairline, borderWidth: StyleSheet.hairlineWidth, flex: 1, opacity: pressed ? 0.7 : 1 },
          ]}>
          <T variant="label">Guide</T>
          <View>
            <T variant="medium">How to Unload</T>
            <T variant="small" tone="faint" style={{ marginTop: 2 }}>
              Before you begin
            </T>
          </View>
        </Pressable>
      </View>

      {waiting > 0 && (
        <Pressable
          onPress={() => router.navigate('/capture')}
          style={({ pressed }) => [
            styles.waiting,
            { backgroundColor: c.surface, borderColor: c.hairline, opacity: pressed ? 0.7 : 1 },
          ]}>
          <View style={[styles.waitingDot, { backgroundColor: c.accent }]} />
          <T variant="body" style={{ flex: 1 }}>
            {waiting === 1 ? 'One thought is waiting for you' : `${waiting} thoughts are waiting for you`}
          </T>
          <Icon name="arrow" size={16} />
        </Pressable>
      )}

      <SectionLabel
        right={
          sessions.length > 0 ? (
            <Pressable onPress={() => router.navigate('/calendar')} hitSlop={8}>
              <T variant="label" tone="soft">
                See all
              </T>
            </Pressable>
          ) : undefined
        }>
        Recent sessions
      </SectionLabel>
      {sessions.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.hairline }]}>
          <T variant="italic" tone="faint" center style={{ fontSize: 17 }}>
            Your sessions will rest here.
          </T>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -space.gutter }}
          contentContainerStyle={{ paddingHorizontal: space.gutter, gap: 10 }}>
          {sessions.slice(0, 8).map((s) => (
            <SessionTile key={s.id} session={s} onPress={() => router.push(`/entry/${s.id}`)} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    marginBottom: space.md,
  },
  question: { marginTop: space.xl, marginBottom: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stateTile: {
    width: '48.5%',
    flexGrow: 1,
    minHeight: 124,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  stateText: { fontFamily: fonts.serifLight, fontSize: 20, lineHeight: 25 },
  miniCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionCard: { height: 124, borderRadius: 22, padding: 16, justifyContent: 'space-between' },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    padding: space.md,
    marginTop: 10,
  },
  waitingDot: { width: 6, height: 6, borderRadius: 3 },
  empty: {
    height: 120,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
