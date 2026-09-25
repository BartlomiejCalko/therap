import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { toneFor } from '@/components/Cards';
import { Enso } from '@/components/Enso';
import { T } from '@/components/T';
import { FadeIn, PillButton, Screen, TextLink } from '@/components/ui';
import { sessionInfo } from '@/content/copy';
import { soft } from '@/lib/haptics';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

const RELEASE_AT = -110;

export default function Complete() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, releaseSession } = useStore();
  const session = data.sessions.find((s) => s.id === id);
  const [choice, setChoice] = useState<'open' | 'kept' | 'released'>('open');

  const y = useSharedValue(0);
  const fade = useSharedValue(1);

  const letGo = () => {
    soft();
    y.value = withTiming(-260, { duration: 900, easing: Easing.in(Easing.cubic) });
    fade.value = withTiming(0, { duration: 800 });
    setTimeout(() => {
      if (session) releaseSession(session.id);
      setChoice('released');
    }, 850);
  };

  const pan = Gesture.Pan()
    .enabled(choice === 'open')
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

  if (!session) return null;
  const info = sessionInfo(session.type);
  const minutes = Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000));
  const goHome = () => router.dismissTo('/');

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ flexGrow: 1 }}>
      <View style={styles.hero}>
        <Enso size={128} />
        <FadeIn delay={1600} style={{ alignItems: 'center' }}>
          <T variant="label" style={{ marginTop: space.lg }}>
            {info.name} · {minutes} min · {session.wordCount} words
          </T>
          <T variant="display" center style={{ marginTop: space.sm }}>
            You made some space.
          </T>
        </FadeIn>
      </View>

      <FadeIn delay={2200} style={{ flex: 1 }}>
        {choice === 'open' ? (
          <>
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.card, { backgroundColor: toneFor(c, session.type) }, card]}>
                <T variant="label">What you unloaded</T>
                <T variant="serifSmall" numberOfLines={7} style={{ marginTop: space.sm }}>
                  {session.text}
                </T>
                <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
                  Swipe up to let it go
                </T>
              </Animated.View>
            </GestureDetector>
            <View style={styles.row}>
              <PillButton title="Keep" kind="secondary" grow onPress={() => setChoice('kept')} />
              <PillButton title="Let it go" grow onPress={letGo} />
            </View>
            <T variant="small" tone="faint" center style={{ marginTop: space.md }}>
              Letting go erases the words. The session stays in your calendar.
            </T>
          </>
        ) : (
          <FadeIn style={styles.after}>
            <T variant="italic" center style={{ fontSize: 22, lineHeight: 30 }}>
              {choice === 'released' ? "Gone. You don't have to carry it." : 'Kept. You can let it go later.'}
            </T>
          </FadeIn>
        )}
      </FadeIn>

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        {data.settings.noticeShift && !session.shift && (
          <View style={{ alignItems: 'center' }}>
            <TextLink
              title="Want to notice what shifted?"
              onPress={() => router.push({ pathname: '/session/shift', params: { id: session.id } })}
            />
          </View>
        )}
        <PillButton title="Done" onPress={goHome} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: space.xxl, paddingBottom: space.xl },
  card: { borderRadius: radius.card, padding: 18 },
  row: { flexDirection: 'row', gap: 10, marginTop: space.md },
  after: { flex: 1, justifyContent: 'center', paddingVertical: space.xl },
});
