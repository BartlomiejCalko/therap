import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import { T } from '@/components/T';
import { Orb, stateTone } from '@/components/StateArt';
import { StateLottie } from '@/components/StateLottie';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { type CheckinState } from '@/content/copy';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

// Where the painting's heart sits, measured from the top of the content (just under the status bar).
const ART_CENTER = 138;

export default function Checkin() {
  const { c } = useTheme();
  const t = useT();
  const { addCheckin } = useStore();
  const { state } = useLocalSearchParams<{ state: CheckinState }>();
  const [name, setName] = useState('');
  const input = useRef<TextInput>(null);

  const { width } = useWindowDimensions();
  // Large: the painting fills the top of the screen, under the transparent bar and slightly
  // behind the question if it needs to.
  const art = Math.min(width * 0.98, 420);

  const next = (withName: boolean) => {
    const checkinId = addCheckin(state, withName ? name : undefined);
    router.push({ pathname: '/affirmation', params: { checkinId } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll={false} edges={['top', 'bottom']}>
        {/* The painting sits behind everything, from under the bar down towards the question. */}
        <View
          pointerEvents="none"
          accessibilityRole="image"
          accessibilityLabel={t.states[state]}
          style={[styles.art, { top: ART_CENTER - art / 2, height: art }]}>
          <View style={styles.artGlow}>
            <Orb size={art * 0.95} color={stateTone(c, state)} glow={0.85} still />
          </View>
          <StateLottie state={state} size={art} />
        </View>

        <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />

        <View style={styles.body}>
          <T variant="title">{t.checkin.question}</T>
          <T variant="small" tone="faint" style={{ marginTop: space.xs }}>
            {t.checkin.hint}
          </T>
          <TextInput
            value={name}
            ref={input}
            onChangeText={setName}
            // The keyboard opens together with the screen, so the question arrives already resting
            // on it. The screen's heavy work (sky, painting) waits until after the slide, which is
            // what keeps the two moving together smoothly.
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
  art: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  artGlow: { position: 'absolute' },
  input: {
    fontFamily: fonts.serif,
    fontSize: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
  actions: { flexDirection: 'row', gap: 10, paddingTop: space.lg, paddingBottom: space.md },
});
