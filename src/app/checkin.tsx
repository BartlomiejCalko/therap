import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, FadeIn, PillButton, Screen, TopBar } from '@/components/ui';
import { type CheckinState } from '@/content/copy';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

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
        <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />

        <View style={styles.body}>
          <FadeIn>
            <T variant="label">{t.checkin.label}</T>
            <T variant="display" style={{ marginTop: space.md }}>
              “{t.states[state]}”
            </T>
          </FadeIn>

          <FadeIn delay={350} style={{ marginTop: space.xxl }}>
            <T variant="serif" tone="soft">
              {t.checkin.question}
            </T>
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder={t.checkin.placeholder}
              placeholderTextColor={c.inkFaint}
              returnKeyType="next"
              onSubmitEditing={() => next(true)}
              style={[styles.input, { color: c.ink, borderBottomColor: c.hairline }]}
            />
          </FadeIn>
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
  body: { flex: 1, justifyContent: 'center' },
  input: {
    fontFamily: fonts.serifLightItalic,
    fontSize: 24,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
  actions: { flexDirection: 'row', gap: 10, paddingBottom: space.md },
});
