import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, SectionLabel, TopBar } from '@/components/ui';
import { DAY_MS, longDate } from '@/lib/date';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

// Placeholder plans until in-app purchases are connected (e.g. RevenueCat / StoreKit).
const TRIAL_DAYS = 7;
const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '— / month', note: 'Cancel any time' },
  { id: 'yearly', name: 'Yearly', price: '— / year', note: 'Two months free' },
];

export default function Subscription() {
  const { c } = useTheme();
  const { onboardedAt } = useStore().data.settings;
  const start = onboardedAt ?? Date.now();
  const end = start + TRIAL_DAYS * DAY_MS;
  const store = Platform.OS === 'android' ? 'Google Play' : 'the App Store';

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <T variant="display">Subscription</T>

      <View style={[styles.current, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        <T variant="label">Current plan</T>
        <T variant="title" style={{ marginTop: space.sm }}>
          Free trial
        </T>
        <Hairline style={{ marginVertical: space.md }} />
        <View style={styles.line}>
          <T variant="small" tone="soft">
            Started
          </T>
          <T variant="small">{longDate(start)}</T>
        </View>
        <View style={styles.line}>
          <T variant="small" tone="soft">
            Ends
          </T>
          <T variant="small">{longDate(end)}</T>
        </View>
      </View>

      <SectionLabel>Available plans</SectionLabel>
      <View style={{ gap: 10 }}>
        {PLANS.map((p) => (
          <View key={p.id} style={[styles.plan, { borderColor: c.hairline }]}>
            <View>
              <T variant="heading">{p.name}</T>
              <T variant="small" tone="faint">
                {p.note}
              </T>
            </View>
            <T variant="medium">{p.price}</T>
          </View>
        ))}
      </View>

      <SectionLabel>How to cancel</SectionLabel>
      <T variant="body" tone="soft">
        Subscriptions are managed by {store}. Open your device settings, tap your name, then Subscriptions, choose
        Unload and cancel. You keep access until the end of the period you paid for.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  current: { marginTop: space.xl, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  plan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: space.lg,
  },
});
