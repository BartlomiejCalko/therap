import { router } from 'expo-router';
import { Linking, Platform, StyleSheet, TextInput, View } from 'react-native';

import { T } from '@/components/T';
import { Chip, CircleButton, Hairline, Row, Screen, SectionLabel, Segmented, Toggle, TopBar } from '@/components/ui';
import { SOUNDS } from '@/content/copy';
import { useT } from '@/i18n';
import { useStore } from '@/store/store';
import type { SessionOptions, ThemeMode } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

const OPTION_KEYS: (keyof SessionOptions)[] = ['starters', 'companion', 'sound', 'breath'];

export default function Settings() {
  const { c } = useTheme();
  const t = useT();
  const { data, updateSettings } = useStore();
  const s = data.settings;
  const setDefault = (patch: Partial<SessionOptions>) => updateSettings({ defaults: { ...s.defaults, ...patch } });
  // With "design each session" on, anything not asked each time falls back to these defaults.
  const fixed = OPTION_KEYS.filter((key) => !s.customizeEachSession || !s.askEachTime[key]);

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />}
        center={<T variant="label">{t.settings.title}</T>}
      />

      <SectionLabel>{t.settings.about}</SectionLabel>
      <Hairline />
      <Row title={t.settings.method} onPress={() => router.push('/settings/method')} />
      {/* The language follows the device. On iOS and Android the app's own settings page offers a per-app language. */}
      <Row
        title={t.settings.language}
        detail={t.settings.languageDetail(t.language)}
        onPress={Platform.OS === 'web' ? undefined : () => Linking.openSettings()}
        last
      />
      <Hairline />

      <SectionLabel>{t.settings.appearance}</SectionLabel>
      <Segmented<ThemeMode>
        value={s.theme}
        onChange={(theme) => updateSettings({ theme })}
        items={[
          { key: 'system', label: t.settings.themes.system },
          { key: 'light', label: t.settings.themes.light },
          { key: 'dark', label: t.settings.themes.dark },
        ]}
      />

      <SectionLabel>{t.settings.sessions}</SectionLabel>
      <Hairline />
      <Row
        title={t.settings.designEach}
        detail={t.settings.designEachHint}
        right={
          <Toggle
            label={t.settings.designEach}
            value={s.customizeEachSession}
            onChange={(v) => updateSettings({ customizeEachSession: v })}
          />
        }
      />
      {s.customizeEachSession && (
        <View style={[styles.nested, { borderLeftColor: c.hairline }]}>
          <T variant="label" style={{ marginTop: space.md }}>
            {t.settings.askEachTime}
          </T>
          {OPTION_KEYS.map((key, i) => (
            <Row
              key={key}
              title={t.settings.options[key].title}
              last={i === OPTION_KEYS.length - 1}
              right={
                <Toggle
                  label={t.settings.askAbout(t.settings.options[key].title)}
                  value={s.askEachTime[key]}
                  onChange={(v) => updateSettings({ askEachTime: { ...s.askEachTime, [key]: v } })}
                />
              }
            />
          ))}
        </View>
      )}

      {fixed.length > 0 && (
        <>
          <T variant="label" style={{ marginTop: space.lg, marginBottom: space.xs }}>
            {s.customizeEachSession ? t.settings.alwaysUse : t.settings.everySession}
          </T>
          {fixed.map((key) =>
            key === 'sound' ? (
              <View key={key} style={{ paddingVertical: space.md, gap: space.md }}>
                <View>
                  <T variant="body">{t.settings.options.sound.title}</T>
                  <T variant="small" tone="faint">
                    {t.settings.options.sound.detail}
                  </T>
                </View>
                <View style={styles.chips}>
                  {SOUNDS.map((id) => (
                    <Chip
                      key={id}
                      size="sm"
                      label={t.sounds[id]}
                      selected={s.defaults.sound === id}
                      onPress={() => setDefault({ sound: id })}
                    />
                  ))}
                </View>
                <Hairline />
              </View>
            ) : (
              <Row
                key={key}
                title={t.settings.options[key].title}
                detail={t.settings.options[key].detail}
                right={
                  <Toggle
                    label={t.settings.options[key].title}
                    value={s.defaults[key] as boolean}
                    onChange={(v) => setDefault({ [key]: v })}
                  />
                }
              />
            ),
          )}
        </>
      )}

      <Row
        title={t.settings.showHowTo}
        detail={t.settings.showHowToHint}
        right={
          <Toggle
            label={t.settings.showHowTo}
            value={s.showHowToWrite}
            onChange={(v) => updateSettings({ showHowToWrite: v })}
          />
        }
      />
      <Row
        title={t.settings.noticeShift}
        detail={t.settings.noticeShiftHint}
        last
        right={
          <Toggle
            label={t.settings.noticeShift}
            value={s.noticeShift}
            onChange={(v) => updateSettings({ noticeShift: v })}
          />
        }
      />
      <Hairline />

      <SectionLabel>{t.settings.privacy}</SectionLabel>
      <Hairline />
      <Row
        title={t.settings.pin}
        detail={s.pinEnabled ? t.settings.on : t.settings.off}
        onPress={() => router.push('/settings/pin')}
      />
      <Row
        title={t.settings.data}
        detail={t.settings.dataHint}
        onPress={() => router.push('/settings/privacy')}
        last
      />
      <Hairline />

      <SectionLabel>{t.settings.account}</SectionLabel>
      <Hairline />
      <View style={styles.field}>
        <T variant="small" tone="faint">
          {t.settings.name}
        </T>
        <TextInput
          value={s.name}
          onChangeText={(name) => updateSettings({ name })}
          placeholder={t.settings.namePlaceholder}
          placeholderTextColor={c.inkFaint}
          style={[styles.input, { color: c.ink }]}
        />
      </View>
      <Hairline />
      <View style={styles.field}>
        <T variant="small" tone="faint">
          {t.settings.email}
        </T>
        <TextInput
          value={s.email}
          onChangeText={(email) => updateSettings({ email })}
          placeholder={t.settings.emailPlaceholder}
          placeholderTextColor={c.inkFaint}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: c.ink }]}
        />
      </View>
      <Hairline />
      <Row
        title={t.settings.subscription}
        detail={t.settings.subscriptionHint}
        onPress={() => router.push('/settings/subscription')}
        last
      />
      <Hairline />

      <T variant="label" center style={{ marginTop: space.xxl }}>
        {t.settings.version}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nested: { borderLeftWidth: StyleSheet.hairlineWidth, paddingLeft: space.md, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  field: { paddingVertical: 12, gap: 2 },
  input: { fontFamily: fonts.sans, fontSize: 16, paddingVertical: 4 },
});
