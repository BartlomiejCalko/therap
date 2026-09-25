import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, SectionLabel, TextLink } from '@/components/ui';
import { CHECKIN_STATES } from '@/content/copy';
import { greeting, longDate } from '@/lib/date';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export default function Today() {
  const { c } = useTheme();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();

  return (
    <Screen withTabBar>
      <View style={styles.header}>
        <T variant="label">{longDate(Date.now())}</T>
        <CircleButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <T variant="display" style={{ marginTop: space.lg }}>
        {greeting()}
        {firstName ? `, ${firstName}` : ''}
      </T>
      <T variant="italic" tone="soft" style={{ marginTop: space.xs }}>
        Your thoughts have somewhere to go.
      </T>

      <SectionLabel>What&apos;s on your mind right now?</SectionLabel>
      <View>
        <Hairline />
        {CHECKIN_STATES.map((state) => (
          <View key={state.id}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state: state.id } });
              }}
              style={({ pressed }) => [styles.stateRow, { opacity: pressed ? 0.5 : 1 }]}>
              <T variant="heading" style={{ flex: 1, fontFamily: 'Newsreader_300Light', fontSize: 23 }}>
                {state.label}
              </T>
              <Icon name="arrow" size={18} color={c.inkFaint} />
            </Pressable>
            <Hairline />
          </View>
        ))}
      </View>

      <View style={{ marginTop: space.md }}>
        <TextLink title="Or go straight to session selection" onPress={() => router.push('/choose')} />
        <TextLink title="How to Unload" arrow={false} onPress={() => router.push('/how-to-write')} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  stateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: space.md },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: space.md,
    marginTop: space.lg,
  },
  waitingDot: { width: 6, height: 6, borderRadius: 3 },
  empty: {
    height: 120,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
