import { router } from 'expo-router';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, Screen, TopBar } from '@/components/ui';
import { METHOD } from '@/content/copy';
import { space } from '@/theme/tokens';

export default function Method() {
  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar left={<CircleButton icon="back" label="Back" onPress={() => router.back()} />} />
      <T variant="display">The Unload method</T>
      <T variant="serif" tone="soft" style={{ marginTop: space.md }}>
        {METHOD.intro}
      </T>

      <View style={{ marginTop: space.xl }}>
        {METHOD.steps.map((step, i) => (
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
        Capture
      </T>
      <T variant="body" tone="soft" style={{ marginTop: space.sm }}>
        {METHOD.capture}
      </T>

      <T variant="small" tone="faint" style={{ marginTop: space.xl }}>
        {METHOD.disclaimer}
      </T>
    </Screen>
  );
}
