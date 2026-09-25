import { router } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { T } from '@/components/T';
import { Chip, CircleButton, Hairline, Row, Screen, SectionLabel, Segmented, Toggle, TopBar } from '@/components/ui';
import { SOUNDS } from '@/content/copy';
import { useStore } from '@/store/store';
import type { SessionOptions, ThemeMode } from '@/store/types';
import { useTheme } from '@/theme/theme';
import { fonts, space } from '@/theme/tokens';

const OPTION_ROWS: { key: keyof SessionOptions; title: string; detail: string }[] = [
  { key: 'starters', title: 'Starter prompts', detail: 'A question to begin with' },
  { key: 'companion', title: 'Companion phrases', detail: 'Quiet words above the keyboard while you write' },
  { key: 'sound', title: 'Focus sound', detail: 'A soft loop in the background' },
  { key: 'breath', title: 'Breathing invitation', detail: 'One minute to arrive before writing' },
];

export default function Settings() {
  const { c } = useTheme();
  const { data, updateSettings } = useStore();
  const s = data.settings;
  const setDefault = (patch: Partial<SessionOptions>) => updateSettings({ defaults: { ...s.defaults, ...patch } });
  // With "design each session" on, anything not asked each time falls back to these defaults.
  const fixed = OPTION_ROWS.filter((o) => !s.customizeEachSession || !s.askEachTime[o.key]);

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />}
        center={<T variant="label">Settings</T>}
      />

      <SectionLabel>About</SectionLabel>
      <Hairline />
      <Row title="The Unload method" onPress={() => router.push('/settings/method')} last />
      <Hairline />

      <SectionLabel>Appearance</SectionLabel>
      <Segmented<ThemeMode>
        value={s.theme}
        onChange={(theme) => updateSettings({ theme })}
        items={[
          { key: 'system', label: 'System' },
          { key: 'light', label: 'Light' },
          { key: 'dark', label: 'Dark' },
        ]}
      />

      <SectionLabel>Sessions</SectionLabel>
      <Hairline />
      <Row
        title="Design each session"
        detail="Choose what to include every time you start"
        right={
          <Toggle
            label="Design each session"
            value={s.customizeEachSession}
            onChange={(v) => updateSettings({ customizeEachSession: v })}
          />
        }
      />
      {s.customizeEachSession && (
        <View style={[styles.nested, { borderLeftColor: c.hairline }]}>
          <T variant="label" style={{ marginTop: space.md }}>
            Ask me each time about
          </T>
          {OPTION_ROWS.map((o, i) => (
            <Row
              key={o.key}
              title={o.title}
              last={i === OPTION_ROWS.length - 1}
              right={
                <Toggle
                  label={`Ask about ${o.title}`}
                  value={s.askEachTime[o.key]}
                  onChange={(v) => updateSettings({ askEachTime: { ...s.askEachTime, [o.key]: v } })}
                />
              }
            />
          ))}
        </View>
      )}

      {fixed.length > 0 && (
        <>
          <T variant="label" style={{ marginTop: space.lg, marginBottom: space.xs }}>
            {s.customizeEachSession ? 'Always use' : 'Every session includes'}
          </T>
          {fixed.map((o) =>
            o.key === 'sound' ? (
              <View key={o.key} style={{ paddingVertical: space.md, gap: space.md }}>
                <View>
                  <T variant="body">{o.title}</T>
                  <T variant="small" tone="faint">
                    {o.detail}
                  </T>
                </View>
                <View style={styles.chips}>
                  {SOUNDS.map((snd) => (
                    <Chip
                      key={snd.id}
                      size="sm"
                      label={snd.name}
                      selected={s.defaults.sound === snd.id}
                      onPress={() => setDefault({ sound: snd.id })}
                    />
                  ))}
                </View>
                <Hairline />
              </View>
            ) : (
              <Row
                key={o.key}
                title={o.title}
                detail={o.detail}
                right={
                  <Toggle
                    label={o.title}
                    value={s.defaults[o.key] as boolean}
                    onChange={(v) => setDefault({ [o.key]: v })}
                  />
                }
              />
            ),
          )}
        </>
      )}

      <Row
        title="Show “How to write”"
        detail="A small guide on the session screen"
        right={
          <Toggle
            label="Show How to write"
            value={s.showHowToWrite}
            onChange={(v) => updateSettings({ showHowToWrite: v })}
          />
        }
      />
      <Row
        title="Notice the shift"
        detail="Invite me to notice what changed after a session"
        last
        right={
          <Toggle label="Notice the shift" value={s.noticeShift} onChange={(v) => updateSettings({ noticeShift: v })} />
        }
      />
      <Hairline />

      <SectionLabel>Privacy & security</SectionLabel>
      <Hairline />
      <Row
        title="PIN lock"
        detail={s.pinEnabled ? 'On' : 'Off'}
        onPress={() => router.push('/settings/pin')}
      />
      <Row title="Your data" detail="What is stored and where" onPress={() => router.push('/settings/privacy')} last />
      <Hairline />

      <SectionLabel>Account</SectionLabel>
      <Hairline />
      <View style={styles.field}>
        <T variant="small" tone="faint">
          Name
        </T>
        <TextInput
          value={s.name}
          onChangeText={(name) => updateSettings({ name })}
          placeholder="Your first name"
          placeholderTextColor={c.inkFaint}
          style={[styles.input, { color: c.ink }]}
        />
      </View>
      <Hairline />
      <View style={styles.field}>
        <T variant="small" tone="faint">
          Email
        </T>
        <TextInput
          value={s.email}
          onChangeText={(email) => updateSettings({ email })}
          placeholder="you@example.com"
          placeholderTextColor={c.inkFaint}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: c.ink }]}
        />
      </View>
      <Hairline />
      <Row title="Subscription" detail="Plan, renewal and how to cancel" onPress={() => router.push('/settings/subscription')} last />
      <Hairline />

      <T variant="label" center style={{ marginTop: space.xxl }}>
        Unload · 1.0
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
