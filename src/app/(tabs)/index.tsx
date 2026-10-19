import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { SessionTile } from '@/components/Cards';
import { Glyph } from '@/components/Glyph';
import { Icon } from '@/components/Icon';
import { InkPress } from '@/components/motion';
import { Orb, stateTone } from '@/components/StateArt';
import { StateLottie } from '@/components/StateLottie';
import { Sunrise } from '@/components/Sunrise';
import { T } from '@/components/T';
import { FadeIn, Screen, SectionLabel } from '@/components/ui';
import { CHECKIN_STATES } from '@/content/copy';
import { useT } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';

const GRID_GAP = 12;

export default function Today() {
  const { c } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();
  const [scrolled, setScrolled] = useState(false);
  const tile = (Math.min(width, 520) - space.gutter * 2 - GRID_GAP) / 2;

  // A fixed bar: the app's name, and the person as an avatar that opens their profile.
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
          { backgroundColor: c.surface, borderColor: c.gold, opacity: pressed ? 0.7 : 1 },
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
      header={header}
      scrollEventThrottle={32}
      onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 4)}>
      {/* The question, in two voices: upright, then an italic accent, like a line of a poem. */}
      <FadeIn style={styles.hero}>
        <T style={[styles.lead, { color: c.ink }]}>{t.today.questionLead}</T>
        <T style={[styles.accent, { color: c.ink }]}>{t.today.questionAccent}</T>
        <View style={[styles.goldRule, { backgroundColor: c.gold }]} />
        <T variant="small" tone="soft" center style={{ paddingHorizontal: space.lg }}>
          {t.today.invite}
        </T>
      </FadeIn>

      {/* The four ways in: living watercolours, each glowing in its own colour. */}
      <View style={styles.grid}>
        {CHECKIN_STATES.map((state, i) => (
          <FadeIn key={state} delay={200 + i * 90} style={{ width: tile }}>
            <InkPress
              accessibilityRole="button"
              accessibilityLabel={`${t.states[state]}. ${t.today.stateLines[state]}`}
              inkColor={c.gold}
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state } });
              }}
              style={[styles.tile, { backgroundColor: c.surface, borderColor: c.hairline }]}>
              <View style={styles.tileArt}>
                <View style={StyleSheet.absoluteFill}>
                  <Orb size={tile - 24} color={stateTone(c, state)} glow={0.85} still />
                </View>
                <StateLottie state={state} size={tile - 24} />
              </View>
              {/* A fixed text block keeps every tile in the grid the same height. */}
              <View style={styles.tileText}>
                <T style={[styles.tileTitle, { color: c.ink }]} numberOfLines={2}>
                  {t.states[state]}
                </T>
                <T variant="small" tone="faint" numberOfLines={2} style={{ marginTop: 2, paddingHorizontal: 4 }}>
                  {t.today.stateLines[state]}
                </T>
              </View>
            </InkPress>
          </FadeIn>
        ))}
      </View>

      {/* Straight to a session: a warm sun rising, its rays breathing. */}
      <FadeIn delay={600} style={{ marginTop: space.xl }}>
        <InkPress
          accessibilityRole="button"
          accessibilityLabel={`${t.today.chooseSession}. ${t.today.chooseSessionLine}`}
          inkColor={c.gold}
          onPress={() => {
            tap();
            router.push('/choose');
          }}
          style={[styles.banner, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <View pointerEvents="none" style={styles.bannerSun}>
            <View style={styles.bannerOrb}>
              <Orb size={190} color={c.gold} glow={1} />
            </View>
            <Sunrise size={130} weight={0.55} color={c.gold} />
          </View>
          <T style={[styles.bannerTitle, { color: c.ink }]}>{t.today.chooseSession}</T>
          <T variant="small" tone="soft" center style={styles.bannerLine}>
            {t.today.chooseSessionLine}
          </T>
          <View style={[styles.bannerHint, { borderColor: c.gold }]}>
            <T variant="medium" style={{ fontSize: 13, letterSpacing: 0.6 }}>
              {t.today.chooseSessionHint}
            </T>
            <Icon name="arrow" size={14} color={c.ink} />
          </View>
        </InkPress>
      </FadeIn>

      <FadeIn delay={680} style={{ marginTop: space.xl }}>
        <InkPress
          accessibilityRole="button"
          inkColor={c.gold}
          onPress={() => {
            tap();
            router.push('/how-to-write');
          }}
          style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Glyph name="pen" size={34} color={c.gold} />
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
            inkColor={c.gold}
            onPress={() => router.navigate('/capture')}
            style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
            <Glyph name="cloud" size={34} color={c.gold} />
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
        <View style={[styles.empty, { borderColor: c.hairline, backgroundColor: c.surface }]}>
          <Glyph name="arch" size={44} color={c.gold} />
          <T variant="italic" tone="soft" center style={{ fontSize: 17 }}>
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
  wordmark: { fontFamily: fonts.sansMedium, fontSize: 13, letterSpacing: 5 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 22 },
  hero: { alignItems: 'center', paddingTop: space.xl, paddingBottom: space.xl },
  lead: { fontFamily: fonts.serifLight, fontSize: 42, lineHeight: 46, textAlign: 'center', letterSpacing: -0.5 },
  accent: { fontFamily: fonts.serifLightItalic, fontSize: 46, lineHeight: 52, textAlign: 'center', letterSpacing: -0.5 },
  goldRule: { width: 36, height: 1, marginTop: space.md, marginBottom: space.md, opacity: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  tile: {
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    paddingBottom: 16,
  },
  tileArt: { alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tileText: { height: 86 },
  tileTitle: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23, paddingHorizontal: 4 },
  banner: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 28,
  },
  bannerSun: { alignItems: 'center', justifyContent: 'center', height: 120 },
  bannerOrb: { position: 'absolute', top: -30 },
  bannerTitle: { fontFamily: fonts.serifLight, fontSize: 32, lineHeight: 38, marginTop: space.sm },
  bannerLine: { marginTop: 6, maxWidth: 290 },
  bannerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: space.lg,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
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
