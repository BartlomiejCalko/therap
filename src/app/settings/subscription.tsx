import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, SectionLabel, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { DAY_MS } from '@/lib/date';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

// Placeholder plans until in-app purchases are connected (e.g. RevenueCat / StoreKit).
const TRIAL_DAYS = 7;

export default function Subscription() {
  const { c } = useTheme();
  const t = useT();
  const { onboardedAt } = useStore().data.settings;
  const start = onboardedAt ?? Date.now();
  const end = start + TRIAL_DAYS * DAY_MS;
  const plans = [t.subscription.monthly, t.subscription.yearly];

  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <T variant="display">{t.subscription.title}</T>

      <View style={[styles.current, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        <T variant="label">{t.subscription.current}</T>
        <T variant="title" style={{ marginTop: space.sm }}>
          {t.subscription.trial}
        </T>
        <Hairline style={{ marginVertical: space.md }} />
        <View style={styles.line}>
          <T variant="small" tone="soft">
            {t.subscription.started}
          </T>
          <T variant="small">{t.dates.long(new Date(start))}</T>
        </View>
        <View style={styles.line}>
          <T variant="small" tone="soft">
            {t.subscription.ends}
          </T>
          <T variant="small">{t.dates.long(new Date(end))}</T>
        </View>
      </View>

      <SectionLabel>{t.subscription.plans}</SectionLabel>
      <View style={{ gap: 10 }}>
        {plans.map((p) => (
          <View key={p.name} style={[styles.plan, { borderColor: c.hairline }]}>
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

      <SectionLabel>{t.subscription.howToCancel}</SectionLabel>
      <T variant="body" tone="soft">
        {t.subscription.cancelBody(Platform.OS === 'android' ? 'android' : 'ios')}
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
