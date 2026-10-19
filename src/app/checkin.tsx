import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { T } from '@/components/T';
import { PaintedBackdrop } from '@/components/PaintedBackdrop';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { type CheckinState, type SessionType } from '@/content/copy';
import { STATE_ART } from '@/content/sessionArt';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

// Each state borrows the session painting closest to its colour.
const BACKDROP: Record<CheckinState, SessionType> = {
  'too-much': 'pause',
  scattered: 'space',
  stuck: 'clarity',
  weighing: 'release',
};

export default function Checkin() {
  const { c } = useTheme();
  const t = useT();
  const { addCheckin } = useStore();
  const { state } = useLocalSearchParams<{ state: CheckinState }>();
  const [name, setName] = useState('');

  const next = (withName: boolean) => {
    const checkinId = addCheckin(state, withName ? name : undefined);
    router.push({ pathname: '/affirmation', params: { checkinId } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll={false} edges={['top', 'bottom']}>
        <PaintedBackdrop art={BACKDROP[state]} height={0.5} opacity={0.6} />
        <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />

        {/* Everything is on screen at once, resting just above the keyboard. */}
        <View style={styles.body}>
          <Image
            source={STATE_ART[state]}
            resizeMode="contain"
            accessibilityLabel={t.states[state]}
            style={styles.scene}
          />
          <T style={[styles.question, { color: c.ink }]}>{t.checkin.question}</T>
          <T variant="small" tone="faint" style={{ marginTop: space.xs }}>
            {t.checkin.hint}
          </T>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            accessibilityLabel={t.checkin.question}
            placeholder={t.checkin.placeholder}
            placeholderTextColor={c.inkFaint}
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
  body: { flex: 1, justifyContent: 'flex-end', paddingBottom: space.sm },
  scene: { width: 132, height: 132, alignSelf: 'center', marginBottom: space.lg },
  question: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, letterSpacing: -0.3 },
  input: {
    fontFamily: fonts.serif,
    fontSize: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
  actions: { flexDirection: 'row', gap: 10, paddingTop: space.lg, paddingBottom: space.md },
});
