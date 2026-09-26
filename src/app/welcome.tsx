import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Enso } from '@/components/Enso';
import { T } from '@/components/T';
import { FadeIn, PillButton, Screen } from '@/components/ui';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

export default function Welcome() {
  const { c } = useTheme();
  const t = useT();
  const { updateSettings } = useStore();
  const [name, setName] = useState('');

  const begin = () => {
    updateSettings({ name: name.trim(), onboardedAt: Date.now() });
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll={false} edges={['top', 'bottom']} contentStyle={styles.wrap}>
        <View style={styles.hero}>
          <Enso size={120} />
          <FadeIn delay={900}>
            <T variant="display" center style={{ marginTop: space.xl }}>
              Unload
            </T>
            <T variant="italic" tone="soft" center style={{ marginTop: space.sm }}>
              {t.welcome.tagline}
            </T>
          </FadeIn>
        </View>

        <FadeIn delay={1500} style={{ gap: space.lg }}>
          <View>
            <T variant="label">{t.welcome.nameLabel}</T>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.welcome.namePlaceholder}
              placeholderTextColor={c.inkFaint}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={begin}
              style={[styles.input, { color: c.ink, borderBottomColor: c.hairline }]}
            />
          </View>
          <PillButton title={t.welcome.begin} icon="arrow" onPress={begin} />
        </FadeIn>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'space-between', paddingBottom: space.lg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: {
    fontFamily: fonts.serif,
    fontSize: 22,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
});
