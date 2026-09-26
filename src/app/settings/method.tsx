import { router } from 'expo-router';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { space } from '@/theme/tokens';

export default function Method() {
  const t = useT();
  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      <T variant="display">{t.method.title}</T>
      <T variant="serif" tone="soft" style={{ marginTop: space.md }}>
        {t.method.intro}
      </T>

      <View style={{ marginTop: space.xl }}>
        {t.method.steps.map((step, i) => (
          <View key={step.title}>
            <Hairline />
            <View style={{ flexDirection: 'row', gap: space.lg, paddingVertical: space.lg }}>
              <T variant="label" style={{ marginTop: 6 }}>
                0{i + 1}
              </T>
              <View style={{ flex: 1, gap: space.xs }}>
                <T variant="heading">{step.title}</T>
                <T variant="body" tone="soft">
                  {step.body}
                </T>
              </View>
            </View>
          </View>
        ))}
        <Hairline />
      </View>

      <T variant="label" style={{ marginTop: space.xl }}>
        {t.method.captureLabel}
      </T>
      <T variant="body" tone="soft" style={{ marginTop: space.sm }}>
        {t.method.capture}
      </T>

      <T variant="small" tone="faint" style={{ marginTop: space.xl }}>
        {t.method.disclaimer}
      </T>
    </Screen>
  );
}
