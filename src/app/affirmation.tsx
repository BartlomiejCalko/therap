import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PaintedBackdrop } from '@/components/PaintedBackdrop';
import { T } from '@/components/T';
import { CircleButton, PillButton, Screen, TopBar } from '@/components/ui';
import { useT } from '@/i18n';
import { fonts, space } from '@/theme/tokens';

export default function Affirmation() {
  const t = useT();
  const { checkinId } = useLocalSearchParams<{ checkinId?: string }>();

  return (
    <Screen scroll={false} edges={['top', 'bottom']}>
      <PaintedBackdrop art="clarity" height={1} opacity={0.5} />
      <TopBar left={<CircleButton icon="back" label={t.common.back} onPress={() => router.back()} />} />
      {/* Appears whole and at once: nothing here should slow the person down. */}
      <View style={styles.center}>
        <T variant="display" center style={{ fontFamily: fonts.serifMedium, fontSize: 36, lineHeight: 41 }}>
          {t.affirmation.title}
        </T>
        <T variant="serif" tone="soft" center style={{ marginTop: space.md, fontSize: 24, lineHeight: 31 }}>
          {t.affirmation.subtitle}
        </T>
      </View>
      <View style={{ paddingBottom: space.md }}>
        <PillButton
          title={t.choose.title}
          icon="arrow"
          onPress={() => router.push({ pathname: '/choose', params: checkinId ? { checkinId } : {} })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.xl, paddingHorizontal: space.sm },
});
