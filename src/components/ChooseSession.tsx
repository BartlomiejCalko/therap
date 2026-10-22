import { router } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SESSIONS, type SessionType } from '@/content/copy';
import { SESSION_ART } from '@/content/sessionArt';
import { useT } from '@/i18n';
import { beginSession, type FlowContext } from '@/lib/flow';
import { tap } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, radius, space } from '@/theme/tokens';

import { T } from './T';
import { CircleButton, PillButton } from './ui';

const PILL_W = 44;
const PILL_H = 66;

// The session picker, as a single painted page: the chosen session's watercolour fills the top
// and fades into the paper; below it, its name and length, a line about what it is for, the
// button that starts it, and the four sessions as small round paintings to move between.
// Shared by the Session tab and the check-in / capture flows.
export function ChooseSession({
  ctx,
  onBack,
  bottomInset = 0,
}: {
  ctx: FlowContext;
  onBack?: () => void;
  // Room to leave at the bottom, e.g. for the tab bar.
  bottomInset?: number;
}) {
  const { c, scheme } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { data } = useStore();
  const [selected, setSelected] = useState<SessionType>('pause');
  const session = SESSIONS.find((s) => s.id === selected) ?? SESSIONS[0];
  const copy = t.sessions[selected];
  const dark = scheme === 'dark';
  const art = (id: SessionType) => SESSION_ART[id][dark ? 'dark' : 'light'];
  const initial = data.settings.name.trim().charAt(0).toUpperCase();
  const paintHeight = height * 0.66;

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* The painting: the newly chosen one fades in over the last. */}
      <View pointerEvents="none" style={[styles.paint, { height: paintHeight }]}>
        <Animated.View
          key={`${selected}-${scheme}`}
          entering={FadeIn.duration(450)}
          exiting={FadeOut.duration(450)}
          style={StyleSheet.absoluteFill}>
          <Image source={art(selected)} contentFit="cover" cachePolicy="memory" transition={0} style={{ width, height: paintHeight }} />
        </Animated.View>
        {/* The lower part of the painting dissolves into the paper. */}
        <Svg width="100%" height={paintHeight * 0.55} style={styles.fade} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="paint-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.bg} stopOpacity={0} />
              <Stop offset="0.7" stopColor={c.bg} stopOpacity={0.88} />
              <Stop offset="1" stopColor={c.bg} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#paint-fade)" />
        </Svg>
      </View>

      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        {onBack ? (
          <CircleButton icon="back" label={t.common.back} onPress={onBack} />
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.today.profile}
          onPress={() => {
            tap();
            router.push('/settings');
          }}
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: c.veil, borderColor: c.frame, opacity: pressed ? 0.7 : 1 },
          ]}>
          <T style={[styles.initial, { color: c.accentText }]}>{initial || 'U'}</T>
        </Pressable>
      </View>

      {/* Fills the screen to push its content down; its empty part lets touches through. */}
      <View pointerEvents="box-none" style={[styles.body, { paddingBottom: bottomInset + space.md }]}>
        {/* The four sessions as slim painted pills, side by side in a glass bar above the words. */}
        <View style={[styles.rail, { backgroundColor: c.veil, borderColor: c.frame }]}>
          {SESSIONS.map((s) => {
            const on = s.id === selected;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t.choose.a11y(t.sessions[s.id].name, s.minutes, t.sessions[s.id].line)}
                onPress={() => {
                  if (on) return;
                  tap();
                  setSelected(s.id);
                }}
                style={styles.option}>
                <View style={[styles.pillRing, { borderColor: on ? c.gold : 'transparent' }]}>
                  <Image
                    source={art(s.id)}
                    contentFit="cover"
                    cachePolicy="memory"
                    transition={0}
                    style={[styles.pill, { opacity: on ? 1 : 0.72 }]}
                  />
                </View>
                <T style={[styles.pillName, { color: on ? c.ink : c.inkSoft }]} numberOfLines={1}>
                  {t.sessions[s.id].name}
                </T>
                <T variant="small" style={[styles.pillMinutes, { color: c.inkFaint }]}>
                  {t.common.minutes(s.minutes)}
                </T>
              </Pressable>
            );
          })}
        </View>

        {/* A fixed height, room enough for the longest session's words, so switching sessions
            never moves the bar above. */}
        <Animated.View key={selected} entering={FadeIn.duration(320)} style={styles.words}>
          <T variant="label">
            {copy.name} · {t.common.minutes(session.minutes)}
          </T>
          <T style={[styles.title, { color: c.ink }]}>{copy.line}</T>
          <T variant="body" tone="soft" style={styles.detail}>
            {copy.detail}
          </T>
        </Animated.View>

        <PillButton
          title={t.choose.pick}
          icon="arrow"
          onPress={() => beginSession(selected, ctx, data.settings)}
          style={{ marginTop: space.lg }}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  paint: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.gutter,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 25 },
  body: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.gutter + 4 },
  title: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 43, letterSpacing: -0.5, marginTop: space.sm },
  detail: { marginTop: space.sm, maxWidth: 320 },
  rail: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radius.card + 4,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.lg,
  },
  option: { flex: 1, alignItems: 'center' },
  words: { height: 214 },
  pillRing: { padding: 2.5, borderRadius: (PILL_W + 9) / 2, borderWidth: 1.5 },
  pill: { width: PILL_W, height: PILL_H, borderRadius: PILL_W / 2 },
  pillName: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 20, marginTop: 6 },
  pillMinutes: { fontSize: 11, lineHeight: 14 },
});
