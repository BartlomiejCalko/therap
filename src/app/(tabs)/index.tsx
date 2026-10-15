import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { InkPress, WriteIn } from '@/components/motion';
import { CircleButton, FadeIn, Hairline, Screen, SectionLabel } from '@/components/ui';
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
        {/* The greeting writes itself in, word by word, then the name settles under it. */}
        {firstName ? (
          <>
            <WriteIn
              text={`${t.dates.greeting(now.getHours())},`}
              variant="title"
              tone="soft"
              style={styles.greetingLead}
              delay={150}
            />
            <WriteIn text={firstName} variant="display" style={styles.greetingName} delay={450} />
          </>
        ) : (
          <WriteIn
            text={t.dates.greeting(now.getHours())}
            variant="display"
            style={styles.greetingName}
            delay={150}
          />
        )}
        <FadeIn delay={950}>
          <T variant="italic" tone="soft" style={{ marginTop: space.md }}>
            {t.today.subtitle}
          </T>
        </FadeIn>
      </View>

      <T variant="label" style={styles.question}>
        {t.today.question}
      </T>
      <View>
        {CHECKIN_STATES.map((state, i) => (
          <FadeIn key={state} delay={1150 + i * 70}>
            <Hairline />
            <InkPress
              accessibilityRole="button"
              inkColor={c.ink}
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state } });
              }}
              style={styles.stateRow}>
              <T variant="heading" style={styles.stateText}>
                {t.states[state]}
              </T>
              <Icon name="arrow" size={18} color={c.inkFaint} />
            </InkPress>
          </FadeIn>
        ))}
        <FadeIn delay={1150 + CHECKIN_STATES.length * 70}>
          <Hairline />
        </FadeIn>
      </View>

      <View style={styles.actions}>
        <InkPress
          accessibilityRole="button"
          inkColor={c.onInk}
          inkOpacity={0.14}
          containerStyle={{ flex: 1.2 }}
          onPress={() => {
            tap();
            router.push('/choose');
          }}
          style={[styles.actionCard, { backgroundColor: c.ink }]}>
          <Icon name="unload" size={24} color={c.onInk} />
          <View>
            <T variant="medium" tone="onInk">
              {t.today.chooseSession}
            </T>
            <T variant="small" tone="onInk" style={{ opacity: 0.65, marginTop: 2 }}>
              {t.today.chooseSessionHint}
            </T>
          </View>
        </InkPress>
        <InkPress
          accessibilityRole="button"
          inkColor={c.ink}
          containerStyle={{ flex: 1 }}
          onPress={() => {
            tap();
            router.push('/how-to-write');
          }}
          style={[
            styles.actionCard,
            { backgroundColor: c.surface, borderColor: c.hairline, borderWidth: StyleSheet.hairlineWidth },
          ]}>
          <T variant="label">{t.today.guideLabel}</T>
          <View>
            <T variant="medium">{t.today.guideTitle}</T>
            <T variant="small" tone="faint" style={{ marginTop: 2 }}>
              {t.today.guideHint}
            </T>
          </View>
        </InkPress>
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
