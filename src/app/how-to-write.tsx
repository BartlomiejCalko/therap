import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, PillButton, Screen, TopBar } from '@/components/ui';
import { HOW_TO_WRITE } from '@/content/copy';
import { space } from '@/theme/tokens';

export default function HowToWrite() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        center={<T variant="label">How to write</T>}
        right={<CircleButton icon="close" label="Close" onPress={() => router.back()} />}
      />

      <View style={{ gap: space.md, marginTop: space.md }}>
        {HOW_TO_WRITE.paragraphs.map((p, i) => (
          <T key={i} variant={i === 0 ? 'heading' : 'serif'} tone={i === 0 ? 'ink' : 'soft'}>
            {p}
          </T>
        ))}
      </View>

      <Hairline style={{ marginVertical: space.xl }} />

      <T variant="label">{HOW_TO_WRITE.maybeIntro}</T>
      <View style={{ gap: space.sm, marginTop: space.md }}>
        {HOW_TO_WRITE.examples.map((e) => (
          <T key={e} variant="italic" style={{ fontSize: 21, lineHeight: 30 }}>
            {e}
          </T>
        ))}
      </View>

      <Hairline style={{ marginVertical: space.xl }} />

      <View style={{ gap: space.sm }}>
        {HOW_TO_WRITE.closing.map((p) => (
          <T key={p} variant="serif">
            {p}
          </T>
        ))}
      </View>

      <PillButton
        title="Choose your session"
        icon="arrow"
        style={{ marginTop: space.xxl }}
        onPress={() => {
          router.back();
          if (from !== 'choose') router.push('/choose');
        }}
      />
    </Screen>
  );
}
