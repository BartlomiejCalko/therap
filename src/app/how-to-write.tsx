import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { T } from '@/components/T';
import { CircleButton, Hairline, PillButton, Screen, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { space } from '@/theme/tokens';

export default function HowToWrite() {
  const t = useT();
  const { from } = useLocalSearchParams<{ from?: string }>();
  return (
    <Screen edges={['top', 'bottom']}>
      <TopBar
        center={<T variant="label">{t.howTo.title}</T>}
        right={<CircleButton icon="close" label={t.common.close} onPress={() => router.back()} />}
      />

      <View style={{ gap: space.md, marginTop: space.md }}>
        {t.howTo.paragraphs.map((p, i) => (
          <T key={i} variant={i === 0 ? 'heading' : 'serif'} tone={i === 0 ? 'ink' : 'soft'}>
            {p}
          </T>
        ))}
      </View>

      <Hairline style={{ marginVertical: space.xl }} />

      <T variant="label">{t.howTo.maybeIntro}</T>
      <View style={{ gap: space.sm, marginTop: space.md }}>
        {t.howTo.examples.map((e) => (
          <T key={e} variant="italic" style={{ fontSize: 21, lineHeight: 30 }}>
            {e}
          </T>
        ))}
      </View>

      <Hairline style={{ marginVertical: space.xl }} />

      <View style={{ gap: space.sm }}>
        {t.howTo.closing.map((p) => (
          <T key={p} variant="serif">
            {p}
          </T>
        ))}
      </View>

      <PillButton
        title={t.howTo.cta}
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
