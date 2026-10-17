import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { Glyph } from '@/components/Glyph';
import { Icon } from '@/components/Icon';
import { InkPress } from '@/components/motion';
import { SessionBanner, StateArt } from '@/components/StateArt';
import { Sunrise } from '@/components/Sunrise';
import { T } from '@/components/T';
import { FadeIn, Screen, SectionLabel } from '@/components/ui';
import { CHECKIN_STATES } from '@/content/copy';
import { useT } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';


export default function Today() {
  const { c } = useTheme();
  const t = useT();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();
  const [scrolled, setScrolled] = useState(false);
  const [banner, setBanner] = useState({ w: 0, h: 0 });

  // A fixed bar, like Patreon's: the app's name, and the person as an avatar that opens their profile.
  const header = (
    <View style={[styles.bar, { borderBottomColor: scrolled ? c.hairline : 'transparent' }]}>
      <T style={[styles.wordmark, { color: c.ink }]}>UNLOAD</T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.today.profile}
        hitSlop={8}
        onPress={() => {
          tap();
          router.push('/settings');
        }}
        style={({ pressed }) => [
          styles.avatar,
          { backgroundColor: c.pastel.lavender, borderColor: c.hairline, opacity: pressed ? 0.7 : 1 },
        ]}>
        {firstName ? (
          <T style={[styles.initial, { color: c.ink }]}>{firstName.charAt(0).toUpperCase()}</T>
        ) : (
          <Icon name="settings" size={18} />
        )}
      </Pressable>
    </View>
  );

  return (
    <Screen
      withTabBar
      texture
      header={header}
      scrollEventThrottle={32}
      onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 4)}>
      {/* The question: the invitation the whole screen is built around. */}
      <FadeIn style={styles.hero}>
        <T variant="display" center style={styles.question}>
          {t.today.question}
        </T>
        <T variant="small" tone="faint" center style={{ marginTop: space.sm, paddingHorizontal: space.lg }}>
          {t.today.invite}
        </T>
      </FadeIn>

      {/* The four ways in, each its own small story with a drawing. */}
      <View style={{ gap: 10 }}>
        {CHECKIN_STATES.map((state, i) => (
          <FadeIn key={state} delay={250 + i * 80}>
            <InkPress
              accessibilityRole="button"
              accessibilityLabel={`${t.states[state]}. ${t.today.stateLines[state]}`}
              inkColor={c.ink}
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state } });
              }}
              style={[styles.stateCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="heading" style={styles.stateTitle}>
                  {t.states[state]}
                </T>
                <T variant="small" tone="faint">
                  {t.today.stateLines[state]}
                </T>
              </View>
              <StateArt state={state} c={c} />
            </InkPress>
          </FadeIn>
        ))}
      </View>

      {/* Straight to a session: the sunrise from the tab bar, rising over a dawn wash. */}
      <FadeIn delay={600} style={{ marginTop: space.xl }}>
        <InkPress
          accessibilityRole="button"
          accessibilityLabel={`${t.today.chooseSession}. ${t.today.chooseSessionLine}`}
          inkColor={c.ink}
          onPress={() => {
            tap();
            router.push('/choose');
          }}
          style={styles.banner}>
          {/* The dawn wash is sized to the card, which grows with its text. */}
          <View
            style={StyleSheet.absoluteFill}
            onLayout={(e) => setBanner({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
            {banner.w > 0 && <SessionBanner c={c} width={banner.w} height={banner.h} />}
          </View>
          <View pointerEvents="none" style={styles.bannerSun}>
            <Sunrise size={130} weight={0.55} color={c.ink} />
          </View>
          <T variant="heading" center style={{ fontSize: 26, lineHeight: 32, marginTop: space.md }}>
            {t.today.chooseSession}
          </T>
          <T variant="small" tone="soft" center style={styles.bannerLine}>
            {t.today.chooseSessionLine}
          </T>
          <View style={styles.bannerHint}>
            <T variant="medium" style={{ fontSize: 14 }}>
              {t.today.chooseSessionHint}
            </T>
            <Icon name="arrow" size={14} color={c.ink} />
          </View>
        </InkPress>
      </FadeIn>

      <FadeIn delay={680} style={{ marginTop: space.xl }}>
        <InkPress
          accessibilityRole="button"
          inkColor={c.ink}
          onPress={() => {
            tap();
            router.push('/how-to-write');
          }}
          style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Glyph name="pen" size={34} color={c.inkSoft} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="label">{t.today.guideLabel}</T>
            <T variant="medium">{t.today.guideTitle}</T>
          </View>
          <Icon name="arrow" size={16} color={c.inkFaint} />
        </InkPress>
      </FadeIn>

      {waiting > 0 && (
        <FadeIn delay={740} style={{ marginTop: 10 }}>
          <InkPress
            accessibilityRole="button"
            inkColor={c.ink}
            onPress={() => router.navigate('/capture')}
            style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
            <Glyph name="cloud" size={34} color={c.inkSoft} />
            <T variant="body" style={{ flex: 1 }}>
              {t.today.waiting(waiting)}
            </T>
            <Icon name="arrow" size={16} color={c.inkFaint} />
          </InkPress>
        </FadeIn>
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
          <Glyph name="arch" size={44} color={c.inkFaint} />
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
  bar: {
    height: 56,
    paddingHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { fontFamily: fonts.sansMedium, fontSize: 15, letterSpacing: 3.5 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 22 },
  hero: { alignItems: 'center', paddingTop: space.xl, paddingBottom: space.xl + space.sm },
  question: { fontSize: 32, lineHeight: 38 },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 12,
  },
  stateTitle: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 25 },
  banner: {
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 28,
  },
  bannerSun: { opacity: 0.85 },
  bannerLine: { marginTop: 6, maxWidth: 290 },
  bannerHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: space.md,
  },
  empty: {
    height: 140,
    gap: space.sm,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
