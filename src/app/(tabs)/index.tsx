import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, SectionLabel } from '@/components/ui';
import { CHECKIN_STATES } from '@/content/copy';
import { useT } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

export default function Today() {
  const { c } = useTheme();
  const t = useT();
  const now = useNow();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();

  return (
    <Screen withTabBar texture>
      <View style={styles.header}>
        <T variant="label">{t.dates.long(now)}</T>
        <CircleButton icon="settings" label={t.common.settings} onPress={() => router.push('/settings')} />
      </View>

      {/* The greeting sits on the paper itself — type and space instead of a picture card. */}
      {/* With a name, the greeting steps back and the name carries the weight. */}
      <View style={styles.greeting}>
        {firstName ? (
          <>
            <T variant="title" tone="soft" style={styles.greetingLead}>
              {t.dates.greeting(now.getHours())},
            </T>
            <T variant="display" style={styles.greetingName}>
              {firstName}
            </T>
          </>
        ) : (
          <T variant="display" style={styles.greetingName}>
            {t.dates.greeting(now.getHours())}
          </T>
        )}
        <T variant="italic" tone="soft" style={{ marginTop: space.md }}>
          {t.today.subtitle}
        </T>
      </View>

      <T variant="label" style={styles.question}>
        {t.today.question}
      </T>
      <View>
        {CHECKIN_STATES.map((state) => (
          <View key={state}>
            <Hairline />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state } });
              }}
              style={({ pressed }) => [styles.stateRow, { opacity: pressed ? 0.5 : 1 }]}>
              <T variant="heading" style={styles.stateText}>
                {t.states[state]}
              </T>
              <Icon name="arrow" size={18} color={c.inkFaint} />
            </Pressable>
          </View>
        ))}
        <Hairline />
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
              {t.today.chooseSession}
            </T>
            <T variant="small" tone="onInk" style={{ opacity: 0.65, marginTop: 2 }}>
              {t.today.chooseSessionHint}
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
          <T variant="label">{t.today.guideLabel}</T>
          <View>
            <T variant="medium">{t.today.guideTitle}</T>
            <T variant="small" tone="faint" style={{ marginTop: 2 }}>
              {t.today.guideHint}
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
            {t.today.waiting(waiting)}
          </T>
          <Icon name="arrow" size={16} />
        </Pressable>
      )}

      <SectionLabel
        right={
          sessions.length > 0 ? (
            <Pressable onPress={() => router.navigate('/calendar')} hitSlop={8}>
              <T variant="label" tone="soft">
                {t.today.seeAll}
              </T>
            </Pressable>
          ) : undefined
        }>
        {t.today.recent}
      </SectionLabel>
      {sessions.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.hairline }]}>
          <T variant="italic" tone="faint" center style={{ fontSize: 17 }}>
            {t.today.empty}
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
  greeting: { marginTop: space.lg, marginBottom: space.sm },
  greetingLead: { fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  greetingName: { fontSize: 52, lineHeight: 58, letterSpacing: -1.2, marginTop: 2 },
  question: { marginTop: space.xxl, marginBottom: space.md },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 19 },
  stateText: { flex: 1, fontFamily: fonts.serifLight, fontSize: 23, lineHeight: 29 },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.xl },
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
