import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { toneFor } from '@/components/Cards';
import { Enso } from '@/components/Enso';
import { PaintedBackdrop } from '@/components/PaintedBackdrop';
import { Glyph } from '@/components/Glyph';
import { Dissolve } from '@/components/motion';
import { T } from '@/components/T';
import { FadeIn, PillButton, Screen, TextLink } from '@/components/ui';
import { useT } from '@/i18n';
import { sessionLength } from '@/lib/sessionLength';
import { done, soft } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

const RELEASE_AT = -110;

export default function Complete() {
  const { c } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, releaseSession } = useStore();
  const session = data.sessions.find((s) => s.id === id);
  const [choice, setChoice] = useState<'open' | 'kept' | 'released'>('open');
  const [dissolving, setDissolving] = useState(false);

  const y = useSharedValue(0);
  const fade = useSharedValue(1);
  const paper = useSharedValue(1);

  // The words lift off the card and disperse; the card itself thins out a moment later.
  const letGo = () => {
    if (dissolving) return;
    soft();
    setDissolving(true);
    y.value = withSpring(0);
    fade.value = withTiming(1, { duration: 200 });
    paper.value = withDelay(900, withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }));
  };

  const released = () => {
    done();
    if (session) releaseSession(session.id);
    setChoice('released');
  };

  const pan = Gesture.Pan()
    .enabled(choice === 'open' && !dissolving)
    .onUpdate((e) => {
      y.value = Math.min(0, e.translationY);
      fade.value = 1 + Math.max(-0.7, e.translationY / 300);
    })
    .onEnd((e) => {
      if (e.translationY < RELEASE_AT) {
        scheduleOnRN(letGo);
      } else {
        y.value = withSpring(0);
        fade.value = withTiming(1);
      }
    });

  const card = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: y.value }, { scale: 1 + y.value / 2600 }],
  }));
  const cardPaper = useAnimatedStyle(() => ({ opacity: paper.value }));

  if (!session) return null;
  const goHome = () => router.dismissTo('/');

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ flexGrow: 1 }}>
      <PaintedBackdrop art={session.type} height={0.45} opacity={0.55} />
      <View style={styles.hero}>
        <Enso size={128} />
        <FadeIn delay={1600} style={{ alignItems: 'center' }}>
          <T variant="label" style={{ marginTop: space.lg }}>
            {t.sessions[session.type].name} · {sessionLength(session, t)} · {t.common.words(session.wordCount)}
          </T>
          <T variant="display" center style={{ marginTop: space.sm }}>
            {t.complete.title}
          </T>
        </FadeIn>
      </View>

      <FadeIn delay={2200} style={{ flex: 1 }}>
        {choice === 'open' ? (
          <>
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.card, card]}>
                <Animated.View
                  style={[StyleSheet.absoluteFill, styles.cardPaper, { backgroundColor: toneFor(c, session.type) }, cardPaper]}
                />
                <Animated.View style={cardPaper}>
                  <T variant="label">{t.complete.unloaded}</T>
                </Animated.View>
                <View style={{ marginTop: space.sm }}>
                  <Dissolve
                    text={session.text}
                    go={dissolving}
                    onDone={released}
                    variant="typeSmall"
                    maxWords={60}
                  />
                </View>
                <Animated.View style={cardPaper}>
                  <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
                    {t.complete.swipe}
                  </T>
                </Animated.View>
              </Animated.View>
            </GestureDetector>
            <View style={styles.row}>
              <PillButton
                title={t.complete.keep}
                kind="secondary"
                grow
                disabled={dissolving}
                onPress={() => setChoice('kept')}
              />
              <PillButton title={t.complete.letGo} grow disabled={dissolving} onPress={letGo} />
            </View>
            <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
              {t.complete.note}
            </T>
          </>
        ) : (
          <FadeIn style={styles.after}>
            <Glyph name={choice === 'released' ? 'flame' : 'letter'} size={56} color={c.inkSoft} />
            <T variant="italic" center style={{ fontSize: 22, lineHeight: 30 }}>
              {choice === 'released' ? t.complete.released : t.complete.kept}
            </T>
          </FadeIn>
        )}
      </FadeIn>

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        {data.settings.noticeShift && !session.shift && (
          <View style={{ alignItems: 'center' }}>
            <TextLink
              title={t.complete.noticeShift}
              onPress={() => router.push({ pathname: '/session/shift', params: { id: session.id } })}
            />
          </View>
        )}
        <PillButton title={t.common.done} onPress={goHome} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: space.xxl, paddingBottom: space.xl },
  card: { padding: 18 },
  cardPaper: { borderRadius: radius.card },
  row: { flexDirection: 'row', gap: 10, marginTop: space.md },
  after: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, paddingVertical: space.xl },
});
