import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { T } from '@/components/T';
import { Orb, stateTone } from '@/components/StateArt';
import { StateLottie } from '@/components/StateLottie';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { type CheckinState } from '@/content/copy';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

const SCENE = 190;
const SMALL = 104;

export default function Checkin() {
  const { c } = useTheme();
  const t = useT();
  const { addCheckin } = useStore();
  const { state } = useLocalSearchParams<{ state: CheckinState }>();
  const [name, setName] = useState('');

  // With the keyboard up there is less room: the watercolour steps back to a smaller size so the
  // field never crowds the buttons.
  const scale = useSharedValue(1);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      scale.value = withTiming(SMALL / SCENE, { duration: 260 });
    });
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      scale.value = withTiming(1, { duration: 260 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scale]);
  const sceneStyle = useAnimatedStyle(() => ({
    height: SCENE * scale.value,
    transform: [{ scale: scale.value }],
  }));

  const next = (withName: boolean) => {
    const checkinId = addCheckin(state, withName ? name : undefined);
    router.push({ pathname: '/affirmation', params: { checkinId } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll={false} edges={['top', 'bottom']}>
        <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />

        {/* Everything is on screen at once; only the living watercolour above the question moves. */}
        <View style={styles.body}>
          <Animated.View style={[styles.scene, sceneStyle]} accessibilityRole="image" accessibilityLabel={t.states[state]}>
            <View style={styles.sceneGlow}>
              <Orb size={SCENE * 1.25} color={stateTone(c, state)} glow={0.9} />
            </View>
            <StateLottie state={state} size={SCENE} />
          </Animated.View>
          <T variant="title">{t.checkin.question}</T>
          <T variant="small" tone="faint" style={{ marginTop: space.xs }}>
            {t.checkin.hint}
          </T>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            accessibilityLabel={t.checkin.question}
            returnKeyType="next"
            onSubmitEditing={() => next(true)}
            style={[styles.input, { color: c.ink, borderBottomColor: c.hairline }]}
          />
        </View>

        <View style={styles.actions}>
          <PillButton title={t.common.skip} kind="secondary" onPress={() => next(false)} grow />
          <PillButton title={t.checkin.forward} icon="arrow" onPress={() => next(true)} disabled={!name.trim()} grow />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Anchored to the bottom, so the field always keeps its distance from the buttons below.
  body: { flex: 1, justifyContent: 'flex-end', paddingBottom: space.sm, overflow: 'hidden' },
  scene: { alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  sceneGlow: { position: 'absolute' },
  input: {
    fontFamily: fonts.serif,
    fontSize: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
  actions: { flexDirection: 'row', gap: 10, paddingTop: space.lg, paddingBottom: space.md },
});
