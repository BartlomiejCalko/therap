import { router } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SessionTile } from '@/components/Cards';
import { Glyph } from '@/components/Glyph';
import { Icon } from '@/components/Icon';
import { InkPress } from '@/components/motion';
import { T } from '@/components/T';
import { FadeIn, Screen, SectionLabel } from '@/components/ui';
import { CHECKIN_STATES } from '@/content/copy';
import { SESSION_ART, STATE_ART } from '@/content/sessionArt';
import { useT } from '@/i18n';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';

const ART = 74;

// Keeps the last two words of a heading on one line ("…teraz / w głowie?"), so a short word
// never hangs at the end of a line on its own.
const keepLastWords = (text: string) => {
  const i = text.lastIndexOf(' ');
  return i > 0 ? `${text.slice(0, i)}\u00a0${text.slice(i + 1)}` : text;
};

export default function Today() {
  const { c, scheme } = useTheme();
  const t = useT();
  const { sessions, captures, settings } = useStore().data;
  const waiting = captures.filter((x) => x.status === 'waiting').length;
  const firstName = settings.name.trim();
  const [scrolled, setScrolled] = useState(false);
  const dark = scheme === 'dark';

  // A fixed bar: the app's name, letterspaced, and the person as an avatar that opens their profile.
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
        style={({ pressed }) => [styles.avatar, { backgroundColor: c.pastel.lavender, opacity: pressed ? 0.7 : 1 }]}>
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
      {/* The question, set large on the left like the opening line of a page. */}
      <FadeIn style={styles.hero}>
        <T style={[styles.question, { color: c.ink }]}>{keepLastWords(t.today.question)}</T>
        <T variant="body" tone="soft" style={styles.invite}>
          {t.today.invite}
        </T>
      </FadeIn>

      {/* The four ways in: a soft card each, with its watercolour and a way forward. */}
      <View style={{ gap: 10 }}>
        {CHECKIN_STATES.map((state, i) => (
          <FadeIn key={state} delay={150 + i * 70}>
            <InkPress
              accessibilityRole="button"
              accessibilityLabel={`${t.states[state]}. ${t.today.stateLines[state]}`}
              inkColor={c.ink}
              onPress={() => {
                tap();
                router.push({ pathname: '/checkin', params: { state } });
              }}
              style={[styles.stateCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <T style={[styles.stateTitle, { color: c.ink }]}>{t.states[state]}</T>
                <T variant="small" tone="faint">
                  {t.today.stateLines[state]}
                </T>
              </View>
              <Image source={STATE_ART[state]} contentFit="contain" cachePolicy="memory" transition={0} style={styles.stateArt} />
              <Icon name="arrow" size={16} color={c.inkFaint} />
            </InkPress>
          </FadeIn>
        ))}
      </View>

      {/* Straight to a session: a painted card, the watercolour fading into the paper. */}
      <FadeIn delay={450} style={{ marginTop: space.lg }}>
        <InkPress
          accessibilityRole="button"
          accessibilityLabel={`${t.today.chooseSession}. ${t.today.chooseSessionLine}`}
          inkColor={c.ink}
          onPress={() => {
            tap();
            router.push('/choose');
          }}
          style={[styles.sessionCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <View pointerEvents="none" style={styles.sessionPaint}>
            <Image
              source={SESSION_ART.pause[dark ? 'dark' : 'light']}
              contentFit="cover"
              cachePolicy="memory"
              transition={0}
              style={styles.sessionImage}
            />
            <Svg width="100%" height="100%" viewBox="0 0 1 1" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="session-card-fade" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={c.bg} stopOpacity={1} />
                  <Stop offset="0.55" stopColor={c.bg} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={c.bg} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={1} height={1} fill="url(#session-card-fade)" />
            </Svg>
          </View>
          <View style={{ flex: 1, paddingRight: 120 }}>
            <T variant="label" style={{ color: c.inkSoft }}>
              {t.today.sessionKicker}
            </T>
            <T style={[styles.sessionTitle, { color: c.ink }]}>{t.today.chooseSession}</T>
            <T variant="small" tone="soft" style={{ marginTop: 4 }}>
              {t.today.chooseSessionHint}
            </T>
          </View>
          <View style={[styles.arrowCircle, { backgroundColor: c.veil }]}>
            <Icon name="arrow" size={18} color={c.ink} />
          </View>
        </InkPress>
      </FadeIn>

      <FadeIn delay={520} style={{ marginTop: 10 }}>
        <InkPress
          accessibilityRole="button"
          inkColor={c.ink}
          onPress={() => {
            tap();
            router.push('/how-to-write');
          }}
          style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <Glyph name="pen" size={32} color={c.gold} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="label" tone="faint">
              {t.today.guideLabel}
            </T>
            <T style={[styles.rowTitle, { color: c.ink }]}>{t.today.guideTitle}</T>
          </View>
          <Icon name="arrow" size={16} color={c.inkFaint} />
        </InkPress>
      </FadeIn>

      {waiting > 0 && (
        <FadeIn delay={580} style={{ marginTop: 10 }}>
          <InkPress
            accessibilityRole="button"
            inkColor={c.ink}
            onPress={() => router.navigate('/capture')}
            style={[styles.rowCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
            <Glyph name="cloud" size={32} color={c.gold} />
            <T style={[styles.rowTitle, { color: c.ink, flex: 1 }]}>{t.today.waiting(waiting)}</T>
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
          <Glyph name="arch" size={40} color={c.gold} />
          <T variant="italic" tone="faint" center>
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
  wordmark: { fontFamily: fonts.sansMedium, fontSize: 13, letterSpacing: 4.5 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 25 },
  hero: { paddingTop: space.lg, paddingBottom: space.lg },
  question: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 43, letterSpacing: -0.5, maxWidth: 300 },
  invite: { marginTop: space.sm, maxWidth: 300 },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingLeft: 18,
    paddingRight: 16,
    minHeight: 86,
  },
  stateTitle: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 27 },
  stateArt: { width: ART, height: ART },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 22,
    minHeight: 132,
  },
  sessionPaint: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '68%' },
  sessionImage: { position: 'absolute', top: -40, right: 0, width: '100%', height: 260 },
  sessionTitle: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, marginTop: 6 },
  arrowCircle: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: space.md,
  },
  rowTitle: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 25 },
  empty: {
    height: 130,
    gap: space.sm,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
